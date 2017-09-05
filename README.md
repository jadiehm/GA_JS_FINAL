# IN PROGRESS: Census API county data mapper

The goal of this app is to make calls to the Census API, return county-level demographic data, and display that on a D3.js choropleth map. The data would be limited to categories that could be displayed in percentages (data returned/total population) through a dropdown menu. If I can get this up and running, I would also like to allow users to search by county with autocomplete text and to toggle between a choropleth map and a porportional bubble map.

## Tools used

1. [Census API](http://api.census.gov/data/)
2. [jQuery](http://jquery.com/)
3. [D3.js](https://d3js.org/)
4. [D3.js topojson](https://github.com/topojson/topojson/wiki/Gallery)
5. [D3.js queue](https://github.com/d3/d3-queue)
6. [Underscore.js](http://underscorejs.org/)

## Technical requirements

This project will follow the requirements outlined [here](https://github.com/ga-students/JS-NYC-6.27.17/blob/master/projects/final-project/final-project.md)

## Project to-dos

1. ~~Make AJAX calls to get total population data by county and initial demographic data~~
2. ~~Draw D3 county map~~
3. ~~Color map based on demographic data~~
4. ~~Set up dropdown and pass value variable to AJAX call to pull corresponding demographic data~~
5. Add in more demographic variables (IN PROGRESS)
6. ~~Tie county data points to tooltip on hover and align tooltip to left or right depending on X position~~
7. ~~Draw circles~~
8. If time, create toggle for proportional bubble map instead of choropleth coloring (IN PROGESS: need to troubleshoot getting back to colored map)
9. Hook up search for counties (ABANDONED FOR PROJECT DEADLINE)
