git clone the master branch from ALA repo
enter the folder
git checkout master
change .git/config to put our repo git@github.com:biodiversitydata-se/ala-map-plugin.git
create a branch dedicated to the merge : 
git branch merge_alamaster_230330
git checkout merge_alamaster_230330
push the branch :
git push -u origin merge_alamaster_230330
get the info from the repo to have all the branches :
git pull
import the current ecodata branch we're working on :
git checkout lusm-main


then decide which branch the erge will take place :
git checkout merge_alamaster_230330

and then merge 
git merge lusm-main