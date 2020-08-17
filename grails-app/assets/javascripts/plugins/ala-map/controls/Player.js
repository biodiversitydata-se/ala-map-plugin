/*
 * Copyright (C) 2020 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * Created by Temi on 28/07/20.
 */

/*
 * Custom Leaflet control to play time duration.
 *
 * <p/>
 * <b>Options:</b>
 * <ul>
 *     <li><code>id</code> Unique id for the control</li>
 * </ul>
 * <b>Google analytics tracking</b>
 * <p>
 * Event category - map-player
 * Event action - one of the following
 * <ul>
 *     <li><code>play</code> </li>
 *     <li><code>pause</code></li>
 *     <li><code>stop</code></li>
 *     <li><code>forward</code></li>
 *     <li><code>backward</code></li>
 *     <li><code>replay-on</code></li>
 *     <li><code>replay-off</code></li>
 * </ul>
 * Event label - periodic or cumulative - depending on current selection
 * </p>
 * @class
 */
L.Control.Player = L.Control.extend({
    options: {
        id: "replaceMe",
        position: "bottomleft",
        title: 'Slice records into time period and play them back',
        playClass: "icon-play",
        playTitle:  "Play",
        pauseClass: "icon-pause",
        pauseTitle:  "Pause",
        stopClass: "icon-stop",
        stopTitle:  "Stop",
        forwardClass: "icon-forward",
        forwardTitle: "View next time frame. Button enabled on pause.",
        backwardClass: "icon-backward",
        backwardTitle: "View previous time frame. Button enabled on pause.",
        settingsClass: "icon-cog",
        settingsTitle: "Change settings",
        replayClass: "icon-repeat",
        replayTitle: "Continuous play",
        startYear: undefined,
        endYear: undefined,
        interval: 1,
        playerType: "year",
        timeout: 1
    },
    playerTypes: ['year', 'month'],
    playerStates: {play: 'play', pause: 'pause', stop: 'stop', forward: 'forward', backward: 'backward', replay: 'replay'},
    intervalTypes: ['periodic', 'cumulative'],
    currentIntervalType: 'periodic',
    currentState: 'stop',
    playBtn: undefined,
    stopBtn: undefined,
    pauseBtn: undefined,
    replayBtn: undefined,
    forwardBtn: undefined,
    backwardBtn: undefined,
    intervals: undefined,
    playIndex: undefined,
    timeoutID: undefined,
    map: undefined,
    container: undefined,
    id: undefined,
    includes: L.Mixin.Events,
    initialize: function (options) {
        L.setOptions(this, options)
    },

    onAdd: function (map) {
        var self = this;
        self.map = map;
        var container = L.DomUtil.create("div", "leaflet-control-layers leaflet-control");
        self.container = container
        var playerHTML = "<table>" +
            "<tbody id='"+self.options.id+"'>" +
            "<tr>" +
            "<td>" +
            "<div class=\"btn-group\" data-toggle=\"buttons-radio\">" +
            "  <button type=\"button\" class=\"btn btn-mini play-btn\"><i class='"+self.options.playClass+"' title='"+self.options.playTitle+"'></i></button>" +
            "  <button type=\"button\" class=\"btn btn-mini pause-btn\"><i class='"+self.options.pauseClass+"' title='"+self.options.pauseTitle+"'></i></button>" +
            "  <button type=\"button\" class=\"btn btn-mini stop-btn active\"><i class='"+self.options.stopClass+"' title='"+self.options.stopTitle+"'></i></button>" +
            "</div>" +
            "</td>"+
            "<td>"+
            "<button type=\"button\" class=\"btn btn-mini replay-btn\" data-toggle=\"button\"><i class='"+self.options.replayClass+"' title='"+self.options.replayTitle+"'></button>" +
            "</td>"+
            "<td>" +
            "<div class=\"btn-group backward-forward-btns\">" +
            "  <button type=\"button\" class=\"btn btn-mini backward-btn\"><i class='"+self.options.backwardClass+"' title='"+self.options.backwardTitle+"'></i></button>" +
            "  <button type=\"button\" class=\"btn btn-mini forward-btn\"><i class='"+self.options.forwardClass+"' title='"+self.options.forwardTitle+"'></i></button>" +
            "</div>" +
            "</td>"+
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='3'>" +
            "<div class='status-text'>" +
            "</div>" +
            "</td>" +
            "</tr>" +
            "</tbody>" +
            "</table>";

        self.id = self.options.id;
        $(playerHTML).prependTo(container);

        self.playBtn = $(container).find("#" + self.options.id + " .play-btn")[0];
        self.pauseBtn = $(container).find("#" + self.options.id + " .pause-btn")[0];
        self.stopBtn = $(container).find("#" + self.options.id + " .stop-btn")[0];
        self.replayBtn = $(container).find("#" + self.options.id + " .replay-btn")[0];
        self.forwardBtn = $(container).find("#" + self.options.id + " .forward-btn")[0];
        self.backwardBtn = $(container).find("#" + self.options.id + " .backward-btn")[0];

        L.DomEvent.addListener(self.playBtn, 'click', function(event) {
            if (!self.isPlaying()) {
                self.doPlay();
                ga && ga('send', 'event', 'map-player', self.playerStates.play, self.currentIntervalType);
            }
        });

        L.DomEvent.addListener(self.pauseBtn, 'click', self.isPauseAllowed, self);
        L.DomEvent.addListener(self.pauseBtn, 'click', self.doPause, self);
        L.DomEvent.addListener(self.stopBtn, 'click', self.doStop, self);
        L.DomEvent.addListener(self.forwardBtn, 'click', self.forwardFrame, self);
        L.DomEvent.addListener(self.backwardBtn, 'click', self.backwardFrame, self);
        L.DomEvent.addListener(self.replayBtn, 'click', self.doReplay, self);

        self.on('play', self.updateStatusText, self);
        self.on('forward', self.updateStatusText, self);
        self.on('backward', self.updateStatusText, self);
        self.on('stop', self.updateStatusText, self);
        self.updateStatusText();

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        self.syncButtonsWithModel();
        return container;
    },
    setIntervals: function () {
        var self = this;
        switch (self.options.playerType) {
            case "year":
                if (self.options.startYear && self.options.endYear) {
                    self.intervals = [];
                    var start = self.options.startYear,
                        end = self.options.startYear + self.options.interval,
                        nextIncrement,
                        numberOfRepeats = Math.round((self.options.endYear - self.options.startYear + 1) / self.options.interval);
                    for (var i = 0; i < numberOfRepeats; i++) {
                        self.intervals.push([start, end - 1]);
                        start = end;
                        nextIncrement = end + self.options.interval;
                        if (nextIncrement > self.options.endYear) {
                            end = self.options.endYear + 1;
                        }
                        else {
                            end = nextIncrement;
                        }
                    }
                }
                break;
        }
    },
    doPlay: function (resetIntervals) {
        var self = this;
        self.nextIndex();
        self.setCurrentState(self.playerStates.play);
        self.syncButtonsWithModel();
        if (!self.intervals || resetIntervals) {
            self.setIntervals();
        }

        if (self.playIndex === undefined) {
            self.doStop();
        }
        else {
            self.fire('play', self.getCurrentDuration());
        }
    },
    startTimerForNextFrame: function() {
        var self = this;
        if (self.isPlaying()) {
            self.timeoutID = setTimeout(function () {
                self.doPlay();
            }, self.options.timeout * 1000);
        }
    },
    doPause: function () {
        var self = this;
        if (self.isPlaying()) {
            self.clearTimeout();
            self.setCurrentState(self.playerStates.pause);
            self.syncButtonsWithModel();
            self.fire('pause', {intervalType: self.options.playerType});
            ga && ga('send', 'event', 'map-player', self.playerStates.pause, self.currentIntervalType);
        }
    },
    doStop: function() {
        var self = this;
        if (self.isPlayerActive()) {
            self.clearTimeout();
            self.setCurrentState(self.playerStates.stop);
            self.syncButtonsWithModel();
            self.fire('stop', {intervalType: self.options.playerType});
            ga && ga('send', 'event', 'map-player', self.playerStates.stop, self.currentIntervalType);
        }
    },
    doReplay: function() {
        var self = this;
        setTimeout(function () {
            if (self.isContinuousPlay()) {
                ga && ga('send', 'event', 'map-player', self.playerStates.replay +'-on' , self.currentIntervalType);
            } else {
                ga && ga('send', 'event', 'map-player', self.playerStates.replay +'-off' , self.currentIntervalType);
            }
        }, 0);
    },
    clearTimeout: function () {
        var self = this;
        if (self.timeoutID) {
            clearTimeout(self.timeoutID);
            self.timeoutID = undefined;
        }
    },
    nextIndex: function () {
        var self = this,
            nextIndex;
        if (self.playIndex === undefined) {
            nextIndex = 0;
        }
        else if (self.isContinuousPlay()) {
            if ((self.playIndex + 1) < self.intervals.length) {
                nextIndex = self.playIndex + 1;
            }
            else {
                nextIndex = 0;
            }
        }
        else {
            if ((self.playIndex + 1) < self.intervals.length) {
                nextIndex = self.playIndex + 1;
            }
            else {
                nextIndex = undefined;
            }
        }

        self.playIndex = nextIndex;
    },
    forwardIndex: function () {
        var self = this,
            nextIndex;
        if ((self.playIndex + 1) < self.intervals.length) {
            nextIndex = self.playIndex + 1;
        }
        else {
            nextIndex = 0;
        }

        self.playIndex = nextIndex;
    },
    backwardIndex: function () {
        var self = this,
            nextIndex;
        if ((self.playIndex - 1 ) >= 0) {
            nextIndex = self.playIndex - 1;
        }
        else {
            nextIndex = self.intervals.length - 1;
        }

        self.playIndex = nextIndex;
    },
    forwardFrame: function () {
        var self = this;
        if (self.isPaused()) {
            self.forwardIndex();
            self.fire('forward', self.getCurrentDuration());
            ga && ga('send', 'event', 'map-player', self.playerStates.forward, self.currentIntervalType);
        }
    },
    backwardFrame: function () {
        var self = this;
        if (self.isPaused()) {
            self.backwardIndex();

            self.fire('backward', self.getCurrentDuration());
            ga && ga('send', 'event', 'map-player', self.playerStates.backward, self.currentIntervalType);
        }
    },
    updateStatusText: function () {
        var self = this,
            currentState = self.getCurrentDuration(),
            type = currentState.intervalType,
            interval = currentState.interval,
            text;
        switch (type) {
            case 'year':
                text = "Displaying " + interval.join(" - ");
                break;
        }

        $(self.container).find("#" + self.options.id + " .status-text").html(text);
    },
    syncButtonsWithModel: function() {
        var self = this;
        switch (self.currentState) {
            case self.playerStates.play:
                $(self.playBtn).button('toggle');
                self.disableForwardBackward();
                break;
            case self.playerStates.pause:
                $(self.pauseBtn).button('toggle');
                self.enableForwardBackward();
                break;
            case self.playerStates.stop:
                self.playIndex = undefined;
                $(self.stopBtn).button('toggle');
                self.disableForwardBackward();
                break;
        }
    },
    enableForwardBackward: function() {
        var self = this;
        self.backwardBtn && $(self.backwardBtn).prop('disabled', false);
        self.forwardBtn && $(self.forwardBtn).prop('disabled', false);
    },
    disableForwardBackward: function() {
        var self = this;
        self.backwardBtn && $(self.backwardBtn).prop('disabled', true);
        self.forwardBtn && $(self.forwardBtn).prop('disabled', true);
    },
    isContinuousPlay: function () {
        var self = this;
        return $(self.replayBtn).hasClass('active');
    },
    isPlaying: function () {
        var self = this;
        return $(self.playBtn).hasClass('active');
    },
    isPaused: function () {
        var self = this;
        return $(self.pauseBtn).hasClass('active');
    },
    isStopped: function () {
        var self = this;
        return $(self.stopBtn).hasClass('active');
    },
    isPauseAllowed: function () {
        // pause is only allowed when play is active.
        // pause state is not valid if previous state is stop.
        var self = this;
        if (self.isStopped()) {
            setTimeout(function () {
                self.setCurrentState(self.playerStates.stop);
                self.syncButtonsWithModel();
            },0)
        }
    },
    isPlayerActive: function () {
        var self = this;
        return self.isPlaying() || self.isPaused();
    },
    isPlayerInactive: function () {
        var self = this;
        return self.isStopped();
    },
    setCurrentState: function (state) {
        var self = this;
        if (state) {
            self.currentState = state;
        }
    },
    getCurrentDuration: function () {
        var self = this;
        if (self.playIndex !== undefined) {
            return  {interval: self.intervals[self.playIndex], intervalType: self.options.playerType};
        } else {
            return  {interval: [self.options.startYear, self.options.endYear], intervalType: self.options.playerType};
        }
    },
    setYearRange: function (range) {
        if (range.min && range.max) {
            var self = this,
                state;
            self.options.startYear = new Date(range.min).getFullYear();
            self.options.endYear = new Date(range.max).getFullYear();
            self.setIntervals();
            self.updateStatusText();
        }
    }
});
