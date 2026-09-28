# lusm_upgrade_grails5.md

# before migrating, check if working ok :
## set java 8
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk use java 8.0.392-tem

## then run tests
./gradlew clean test

Starting a Gradle Daemon, 1 incompatible Daemon could not be reused, use --status for details
:clean
:compileAstJava NO-SOURCE
:compileAstGroovy NO-SOURCE
:processAstResources NO-SOURCE
:astClasses UP-TO-DATE
:compileJava NO-SOURCE
:configScript
:compileGroovy
:copyAstClasses NO-SOURCE
:assetPluginPackage
:copyCommands NO-SOURCE
:copyTemplates NO-SOURCE
:processResources
:classes
:compileTestJava NO-SOURCE
:compileTestGroovy NO-SOURCE
:processTestResources NO-SOURCE
:testClasses UP-TO-DATE
:test NO-SOURCE

BUILD SUCCESSFUL

Total time: 17.966 secs

./gradlew check

:compileAstJava NO-SOURCE
:compileAstGroovy NO-SOURCE
:processAstResources NO-SOURCE
:astClasses UP-TO-DATE
:compileJava NO-SOURCE
:configScript UP-TO-DATE
:compileGroovy UP-TO-DATE
:copyAstClasses NO-SOURCE
:assetPluginPackage UP-TO-DATE
:copyCommands NO-SOURCE
:copyTemplates NO-SOURCE
:processResources UP-TO-DATE
:classes UP-TO-DATE
:compileTestJava NO-SOURCE
:compileTestGroovy NO-SOURCE
:processTestResources NO-SOURCE
:testClasses UP-TO-DATE
:test NO-SOURCE
:check UP-TO-DATE

BUILD SUCCESSFUL

Total time: 0.51 secs



## build new branch
git checkout -b upgrade/lusm-grails-5
## switch to java 11
sdk use java 11.0.30-tem

## edit gradle/wrapper/gradle-wrapper.properties
#distributionUrl=https\://services.gradle.org/distributions/gradle-3.4.1-all.zip
distributionUrl=https\://services.gradle.org/distributions/gradle-7.2-bin.zip

then 
./gradlew --version

------------------------------------------------------------
Gradle 7.2
------------------------------------------------------------

Build time:   2021-08-17 09:59:03 UTC
Revision:     a773786b58bb28710e3dc96c4d1a7063628952ad

Kotlin:       1.5.21
Groovy:       3.0.8
Ant:          Apache Ant(TM) version 1.10.9 compiled on September 27 2020
JVM:          11.0.30 (Eclipse Adoptium 11.0.30+7)
OS:           Linux 6.8.0-124-generic amd64


2009  java -version
 2010  source "$HOME/.sdkman/bin/sdkman-init.sh"
 2011  sdk use java 11.0.30-tem
 2012  java -version
 2013  git branch
 2014  cd ../ala-map-plugin_BKP_BEFORE_UPGRADEGRAILS/
 2015  ./gradlew clean test
 2016  sdk use java 8.0.392-tem
 2017  ./gradlew clean test
 2018  cd ../ala-map-plugin
 2019  git branch
 2020  sdk use java 11.0.30-tem
 2021  cd ../ala-map-plugin_BKP_BEFORE_UPGRADEGRAILS/
 2022  sdk use java 8.0.392-tem
 2023  ./gradlew check
 2024  cd ../ala-map-plugin
 2025  sdk use java 11.0.30-tem
 2026  java -version
 2027  ./gradlew --version
 2028  ./gradlew clean test
 2029  sdk use java 8.0.392-tem
 2030  ./gradlew --version
 2031  ./gradlew clean test
 2032  git status
 2033  git commit -m "Baseline before Grails 5 migration"
 2034  sdk use java 11.0.30-tem
 2035  java -version
 2036  ./gradlew --version
 2037  ls -la gradle/wrapper/
 2038  find . -maxdepth 2 -type f | sort
 2039  cat settings.gradle
 2040  cat build/config.groovy
 2041  cat package.json
 2042  git status
 2043  gradle --version
 2044  ./gradlew --version
 2045  java -version
 2046  sdk list gradle
 2047  gradle wrapper --gradle-version 7.2
 2048  git log -1 --oneline
 2049  ./gradlew --version
 2050  cd /tmp
 2051  wget https://services.gradle.org/distributions/gradle-7.2-bin.zip
 2052  unzip gradle-7.2-bin.zip
 2053  /tmp/gradle-7.2/bin/gradle --version
 2054  cd ~/Documents/repos/ala-map-plugin
 2055  /tmp/gradle-7.2/bin/gradle wrapper --gradle-version 7.2
 2056  history
 2057  ./gradlew --version
 2058  which gradle
 2059  ./gradlew --version
 2060  rm -rf /tmp/gradle-7.2 /tmp/gradle-7.2-bin.zip
 2061  ./gradlew --version
 2062  ./gradlew tasks
 2063  grep -R "/tmp/gradle-7.2" ~/.gradle/wrapper ~/.gradle/daemon 2>/dev/null | head -20
 2064  ls -la ~/.gradle/wrapper/dists/gradle-7.2-bin/
 2065  ./gradlew --stop
 2066  pkill -f 'GradleDaemon'
 2067  ls ~/.gradle/wrapper/dists/gradle-7.2-bin/2dnblmf4td7x66yl1d74lt32g/gradle-7.2/lib/plugins/gradle-diagnostics-7.2.jar
 2068  ./gradlew --stop
 2069  ./gradlew --version
 2070  ./gradlew tasks
 2071  ./gradlew tasks --stacktrace
 2072  ./gradlew compileGroovy --stacktrace
 2073  ./gradlew compileJava --stacktrace
 2074  ./gradlew compileTestGroovy --stacktrace
 2075  ./gradlew test --stacktrace
 2076  ./gradlew clean test --stacktrace
 2077  ./gradlew assemble --stacktrace
 2078  ls -lh build/libs/
 2079  find build -maxdepth 2 -type f | sort
 2080  jar tf build/libs/ala-map-plugin-3.1-SNAPSHOT-plain.jar | head -80
 2081  ./gradlew generatePomFileForMavenJarPublication
 2082  find build/publications -type f -maxdepth 3 -print
 2083  cat build/publications/mavenJar/pom-default.xml
 2084  unzip -p build/libs/ala-map-plugin-3.1-SNAPSHOT-plain.jar META-INF/grails-plugin.xml
 2085  grep -R "3\.3\.11" -n .   --exclude-dir=.git   --exclude-dir=build   --exclude='*.jar'
 2086  ./gradlew clean assemble
 2087  unzip -p build/libs/ala-map-plugin-3.1-SNAPSHOT-plain.jar META-INF/grails-plugin.xml
 2088  ./gradlew publishMavenJarPublicationToMavenLocal --stacktrace
 2089  find ~/.m2/repository/org/grails/plugins/ala-map-plugin -maxdepth 2 -type f -print
 2090  ls -lh ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/
 2091  jar tf ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/ala-map-plugin-3.1-SNAPSHOT.jar | head -30
 2092  jar tf ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/ala-map-plugin-3.1-SNAPSHOT-plain.jar | head -30
 2093  jar tf ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/ala-map-plugin-3.1-SNAPSHOT-plain.jar | grep 'META-INF/grails-plugin.xml'
 2094  cat ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/ala-map-plugin-3.1-SNAPSHOT.module
 2095  grep -R "ala-map-plugin" -n .   --exclude-dir=.git   --exclude-dir=build   --exclude-dir=.gradle
 2096  ./gradlew dependencyInsight   --dependency grails-core   --configuration runtimeClasspath
 2097  ./gradlew dependencyInsight   --dependency asset-pipeline-grails   --configuration runtimeClasspath
 2098  ./gradlew dependencyInsight   --dependency spring-boot   --configuration runtimeClasspath
 2099  ./gradlew dependencies --configuration runtimeClasspath
 2100  rm -rf .gradle
 2101  unzip -p build/libs/ala-map-plugin-3.1-SNAPSHOT-plain.jar BuildConfig.groovy
 2102  git ls-files BuildConfig.groovy
 2103  find . -name 'BuildConfig.groovy' -not -path './.git/*' -not -path './build/*'
 2104  git check-ignore -v grails-app/conf/BuildConfig.groovy
 2105  git status --short
 2106  git diff -- gradle.properties gradle/wrapper/gradle-wrapper.properties build.gradle src/main/groovy/au/org/ala/map/AlaMapGrailsPlugin.groovy
 2107  ./gradlew clean assemble
 2108  unzip -p build/libs/ala-map-plugin-3.1-SNAPSHOT-plain.jar META-INF/grails-plugin.xml
 2109  ./gradlew publishMavenJarPublicationToMavenLocal
 2110  ls -lh ~/.m2/repository/org/grails/plugins/ala-map-plugin/3.1-SNAPSHOT/
 2111  history




ALL GOOD !!