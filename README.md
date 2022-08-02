# Mars Pathfinder 3d meshes
Recovering and building 3d meshes from ancient Mars Pathfinder and Sojourner 3d data

# Data format
This data set consists of a set of tables.  Each table contains 3-D
object position information in the form of a Cartesian (x,y,z)
coordinate in units of meters corresponding to each pixel in an IMP
EDR stereo pair acquired in the 670 nm filter. The coordinates are
deduced using an automated machine vision algorithm that correlates
features between the left and right images of stereo pairs to
determine their disparity (difference in image position between the
left and right eye) then computes their 3-D object position taking
into account the camera pointing and stereo optics.  The computer
algorithm is described by Stoker et al. [STOKERETAL1999]() and
summarized below.

Stereo model products (and corresponding tables) have been produced
for two IMP Pathfinder data sets acquired in stereo in the 670 nm
filter. The IMP data sets are described by Gaddis et
al. [GADDISETAL1999]().  The stereo data sets that were analyzed are
called the **Monster Pan** and the **Super Pan**:

 ## Monster Pan
The Monster Pan was a complete stereo panorama of the Pathfinder landing site acquired early
in the mission (sols 3-6).  The monster pan images in the 670 nm
filter were compressed using lossy JPEG compression (6:1 compression
factor) and the image to **image overlap in the panoramic product was
relatively low**.  

(B/W panorama?)

 ## Super Pan
The Super Pan was designed to produce a full panorama
of the landing site with low compression ratio in **all 15 narrow-band
filters** and the 670 nm stereo filter set was losslessly compressed
using Rice compression. It was designed with **increased frame-to-frame
overlap** relative to the Monster Pan to assist with automated matching
between images and insure gap-free stereo coverage.  

The Super Panrepresented a large data volume and was acquired over an 8 week period
from sols 13 to 80.  **It was 83% complete when the mission ended**.
While incomplete, the 3-D reconstructions from the Super Pan images
are **somewhat better than for the Monster Pan due to the increased
image overlap and lower image compression**.


## Data Coverage and Quality

As discussed above, the 3-D position information is deduced matching
brightness patterns in the left and right eyes of the stereo pair.
**When no match is found, or inconsistent matches found in the
correlation and cross correlation, no disparity is calculated and a
value of zero is assigned to the Cartesian coordinate (X=Y=Z=0) in
the table**. Thus, zero values in the table indicate that the stereo
matching algorithm did not yield a good solution at that location.

[more...](https://pds-geosciences.wustl.edu/mpf/mpfl-m-imp-5-3dposition-v1/mpim_2xxx/catalog/dataset.cat)

# Textures
Original textures created by SGI were saved in RGB format (created by SGI itself), not available today online; [JPG versions are available online(https://pds-geosciences.wustl.edu/mpf/mpfl-m-imp-5-3dposition-v1/mpim_2xxx/extras/), but this script needs PPM format.

How to convert texture to uncompressed PPM using IrfanView:

![image](https://user-images.githubusercontent.com/1620953/182336442-a7e36d37-d45d-452e-a1c9-4cb0d5c2c81d.png)



# Resources
- [My collection of data and links on MPF mission](http://win98.altervista.org/pathfinder/)
-  [July 4th, 1997: Successful landing announce](https://mars.nasa.gov/MPF/newspio/mpf/status/pf9707042.html)
-  [Mars Pathfinder ASI/MET Archive CD-ROM at atmos.nmsu.edu](https://atmos.nmsu.edu/PDS/data/mpam_0001/aareadme.htm)
-  [Original NASA page with VRML models (broken links to SGI.com)](https://mars.nasa.gov/MPF/vrml/pathvrml.html)
-  [Folders list at pdsimage2.wr.usgs.gov](https://pdsimage2.wr.usgs.gov/Missions/Mars_Pathfinder/):
    -  mpim_0001/ - 09-Jan-2009 17:41 - SCLK: 1229455934 - 1247913223
    -  mpim_0002/ - 09-Jan-2009 19:12 - SCLK: 1247913268 - 1249772261
    -  mpim_0003/ - 09-Jan-2009 19:19 - SCLK: 1249772268 - 1254046834
    -  mprv_0001/ - 02-Feb-2009 23:31 
-  [Mars Pathfinder radioscience at pds-geosciences.wustl.edu](https://pds-geosciences.wustl.edu/missions/mpf/radioscience.html)
-  Raw 3d data in .TAB format:
    -  [Folder](https://pds-geosciences.wustl.edu/mpf/mpfl-m-imp-5-3dposition-v1/)
    -  [.zip file, 300 MB](https://pds-geosciences.wustl.edu/mpf/mpfl-m-imp-5-3dposition-v1.zip)
    -  [Explanation](https://pds-geosciences.wustl.edu/missions/mpf/imp3d.html)
-  [Images taken by rover, on pdsimage2.wr.usgs.gov](https://pdsimage2.wr.usgs.gov/Missions/Mars_Pathfinder/mprv_0001/browse/)
-  [Images taken by rover, on NASA PDS atlas](https://pds-imaging.jpl.nasa.gov/search/?fq=ATLAS_MISSION_NAME%3A%22mars%20pathfinder%22&fq=ATLAS_SPACECRAFT_NAME%3Asojourner&fq=ATLAS_INSTRUMENT_NAME%3Arvr&fq=-ATLAS_THUMBNAIL_URL%3Abrwsnotavail.jpg&q=*%3A*&start=24)
-  [Images taken by rover, grouped by sol; table with thumbnails](https://mars.nasa.gov/MPF/roverview/table.html)
-  [Clickable map with rover images](https://mars.nasa.gov/MPF/roversci/site-map-Image.html)
-  https://mars.nasa.gov/MPF/index1.html
-  [Digitec mirror of NASA site (anyway broken links to sgi.com vrml models](https://mpf.digitec.net/)
