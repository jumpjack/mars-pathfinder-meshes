<img width="1069" height="611" alt="image" src="https://github.com/user-attachments/assets/7c923dd1-0f07-46c8-9175-03b9f730ffbd" />


This page allows viewing two types of data:
- Panoramas taken by the lander
- All pictures of the rover taken by the lander during  rover operations, in movie-like sequence

The page works both if downloaded locally or if accessed online, see [DEMO](https://jumpjack.github.io/mars-pathfinder-meshes/rover-movies/pathfinder-panoviewer.html).

## Ready data

You can directly load a ready-made GLB file (3d model) of the panorama and a .zip file of rover movie directly from FILE menu. Note that original NASA datasets are 3 (mipm_0001, mpim_0002, mpim_0003), but due to github size contraints the mpim_0002 dataset has been split in 2 parts.


## Custom data

You can also create panorama and video from scratch using DEVELOPER menu

### Panoramas

To view panoramas, download in advance the raw version of one or more of these csv files, containing links to the tiles manually extracted  from index pages ([1](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/index.htm), 
[2](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0002/browse/mars/index.htm), 
[3](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0003/browse/mars/index.htm)), then load them into the page:

- GALLERY PAN/PRESIDENTIAL PAN, [TIER 1](https://github.com/jumpjack/mars-pathfinder-meshes/blob/main/rover-movies/MARS-%20GALLERY%20PAN-PRESIDENTIAL%20PAN%20TIER%201%20BLUE.csv), BLUE FILTER ([lander](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/mars021.htm))
- GALLERY PAN/PRESIDENTIAL PAN, [TIER 2](https://github.com/jumpjack/mars-pathfinder-meshes/blob/main/rover-movies/MARS-%20GALLERY%20PAN-PRESIDENTIAL%20PAN%20TIER%202%20BLUE.csv), BLUE FILTER ([bottom](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/mars024.htm))
- GALLERY PAN/PRESIDENTIAL PAN, [TIER 3](https://github.com/jumpjack/mars-pathfinder-meshes/blob/main/rover-movies/MARS-%20GALLERY%20PAN-PRESIDENTIAL%20PAN%20TIER%203%20BLUE.csv), BLUE FILTER ([middle](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/mars027.htm))
- GALLERY PAN/PRESIDENTIAL PAN, [TIER 4](https://github.com/jumpjack/mars-pathfinder-meshes/blob/main/rover-movies/MARS-%20GALLERY%20PAN-PRESIDENTIAL%20PAN%20TIER%204%20BLUE.csv), BLUE FILTER ([horizon 1](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/mars030.htm))
- GALLERY PAN/PRESIDENTIAL PAN, [TIER 5](https://github.com/jumpjack/mars-pathfinder-meshes/blob/main/rover-movies/MARS-%20GALLERY%20PAN-PRESIDENTIAL%20PAN%20TIER%205%20BLUE.csv), BLUE FILTER ([horizon 2](https://planetarydata.jpl.nasa.gov/img/data/mpfl-m-imp-2-edr-v1.0/mpim_0001/browse/mars/mars033.htm))

Once loaded the tiles metadata, you can download JPG textures or GIF textures; 
JPG textures are very low-res and were made available due to very low bandwidth available to the public in 1997,
today you can use GIF textures, which will download in 1 minute or 2. Don't forget to turn on the GIF cehcobiox to see them.

Now the panorama is ready; by default the camera rotates around the lander, but double clicking on a tile center rotation on it. 
Click RESET CAMERA to reset rotation pivot to lander.

Click on one tile to highligh its metadata in the list on the left

## Rover movies
By default it is selected the page https://planetarydata.jpl.nasa.gov/data/mpfl-m-imp-2-edr-v1.0/mpim_0002/browse/rover/index.htm, 
but there are also mpim_0001 and mpim_0003 available (edit the link manually). Once the right link is ready, click APRI/OPEN to 
show its contents (not needed for processing, but useful to decide which sub-page to select) or MOSTRA/SHOW to process it.

Once the page is processed, the list below will be populated with available sequences: choose the one labeled with "movie" in the index page loaded before,
then click the button to process the movie.
Once all images and metadata have been downloaded, a slider will be enabled, allowing to browse/view all images overlayed to the panorama, showing how Sojourner
moved around, sniffing, digging and taking pictures. :-)


