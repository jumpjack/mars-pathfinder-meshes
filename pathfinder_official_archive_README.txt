Index:
  Introduction
  Geometry Files
  Image Texture Files
  Naming convention
  Reference Frame
  How these models were produced
  Accuracy of the models
  Credit

Introduction:
-------------

This directory sub-tree contain photorealistic 3D terrain models of
the Mars Pathfinder Landing Site. The two main directory contain:

  demos directory :	Contains the low resolution scene with different
  ----------------	1/2 resolution textures overlay. The all_*.wrl
			will load the all scene at once.

  archive directory :	contain all the geometry, full texture files and
  -------------------	"batchload" files.

The files are of two types: 

  1) the geometry files containing topographic information.
  2) The texture files associated with these geometry files.

The Geometry files have been created from Monster Pan stereo image
pairs (filter #5) by the Ames Stereo Pipeline V2.1.They are written in
VRML 2.0 Ascii format. They are available in four resolution:
(D):48,500 (C):97,000 (B):485,000 and (A):1,000,000 polygons for the
all scene. the file name pattern for those file is t9#####[ABCD].wrl
with:
	t	: file type: terrain
	9######	: timestamp (see below for full explanation)
	[ABCD]  : resolution (see below for full explanation)
	.wrl    : file type extension: VRML

Far field terrains for which no topographic information has been
computed can be displayed on a cylindrical billboard. The file name
pattern for those file is b9#####Z.wrl with:
	b	: file type: billboard
	9######	: timestamp (see below for full explanation)
	Z	: resolution (see below for full explanation)
	.wrl    : file type extension: VRML

There is four type of textures that can be overlaid on top of the
geometry files: The file name pattern for those file is i9#####[ACET].jpg
with:
	b	: file type: image texture
	9######	: timestamp (see below for full explanation)
	[ACET]	: resolution (see below for full explanation)
	.jpg	: file type extension: JPEG image file format

  1) filter #5 images of the Monster Pan.		i9#####T.jpg
  2) Gallery Pan in color				i9#####C.jpg
  3) Gallery Pan in enhanced color (artistic)		i9#####E.jpg
  4) Monster Pan with color coded altitude overlay	i9#####A.jpg

In order to change the type of texture to be displayed change the
texture filename accordingly at line 26 of the geometry files (terrains
and billboards). Corresponding Geometry and texture files have the
same timestamp number (see below). The filename convention are
described in detail below.

Extra files allowing to display multiple files at once are also available:

- The terrain_*.wrl files load all the terrain files (at a given
  resolution) at once
- The billboard.wrl file load all the billboard files at once.
- The Lander file contain a CAD model of the Mars Pathfinder lander
  with its petals deployed
- The all_*.wrl files load a all scene at once (terrains, billboards,
  lander and background colors).


Geometry Files:
---------------

  Billboards:
	Billboards are used to display far field data (beyond 25 meter
	from the lander) for which no topography data is available. 
	filename pattern: b9#####Z.wrl
	file format	: VRML 2.0 Ascii
	associated texture filename at line 26
	number of polygons per file: 2

  Terrains:
	Terrain files contain the geometry (topography) of the Landing
	site out to 25 meters from the Lander.
	filename pattern: t9#####[ABCD].wrl
	file format	: VRML 2.0 Ascii
	associated texture filename at line 26
	There is 388 terrain files, one per stereo image pair in four
	resolutions:

	filename  number of polygons	   number of polygons
		     per files.		   for the all scene.

      t9#####A.wrl     10,000		       1,000,000 
      t9#####B.wrl	5,000			 485,000 
      t9#####C.wrl	1,000			  97,000 
      t9#####D.wrl	  500			  48,500 


Image Texture Files:
--------------------
	There is four different texture types:
	     T: Black and White texture from the filter #5 images of
		the Monster Pan corrected for exposure time
		differences and coded on 8bits/pixels.

	     C: Color texture from the Gallery Pan. This texture has
		been manually corrected to match the MIPL colors but
		one should avoid doing photogrametry on them. The
		Images have been mosaicked and re-cut to match the
		Monster Pan distribution pattern. The Sojourner rover
		has been manually removed from the side of Yogi and
		put back at the bottom of the ramp.

	     E: Enhanced color texture from the Gallery Pan. This
		texture followed a similar process as the color
		texture. It was also enhanced to increase the contrast
		between rocks, undisturbed and loose soil. This
		texture is to be considered as an artistic coloring.

	     A: B&W texture from the Monster Pan with color coded
		elevation (altitude) overlay. color range [blue; red]
		map onto [-2; 2] relative to the origin of the Mars
		Local Level Coordinate Frame. The color variation is
		linear inside the range and saturate outside of
		it. The color information was computed from the
		elevation value of each re-projected pixels. Pixels for
		which no elevation data were available are left in
		gray. 


Naming convention
-----------------
  Original image names:

example:	i1246929008l.img_0069065980	left eye image 
		i1246929008r.img_0069065981	associated right eye image

		i##########l.img_##########
		|	   |	     <----> image number within the sequence
		|	   |	 <--> sequence number
		|	   |<---> data type: image
		|	   ^ l or r Left or Right eye image
		|<--------> timestamp (time of capture in seconds)
		^ data type: image

The name have been modified as follow to fit in a 8+3 character
pattern. The 

image texture
name pattern:	    i9#####*.jpg
		    |	   ^ texture type: A: B&W texture with color
		    |	     coded altitude overlay
		    |<----> 6 last digit of the timestamp (first digit
		    |	    is always 9) 
		    ^ data type: image
geometry file
name pattern:
	terrains:   t9#####*.wrl
		    |	   ^ number of polygons per file : A->10,000 
		    |					   B-> 5,000 
		    |					   C-> 1,000
		    |					   D->   500
		    |<----> 6 last digit of the timestamp (first digit
		    |	    is always 9) 
		    ^ data type: terrain 

	billboards: b9#####*.wrl
		    |	   ^ number of polygons per file : Z -> 2 polygons
		    |<----> 6 last digit of the timestamp (first digit
		    |	    is always 9) 
		    ^ data type: billboards



Reference Frame :	The models are in a Mars local level
---------------		reference frame with the z axis up.


How these models were produced:
-------------------------------

The process of building photo-realistic terrains consists of a
pipeline of successive processing stages commonly referred to as the
Ames Stereo Pipeline.

The input to the Stereo Pipeline consists of images from a calibrated
stereo pair. The first step in processing the input stereo pair is
referred to as preprocessing. First, optional cropping and subsampling
can be performed on a selected region of interest. Histogram
equalization and edge enhancement can then be performed to improve
downstream correlation performance. Finally, the input stereo pair is
rectified to account for systematic epipolar and rotational offsets in
the stereo pair.

The second step in the pipeline correlates the stereo pair, generating
a dense disparity map. A three-pass correlation approach is used to
improve both speed and accuracy. The first pass of the correlator
bounds the disparity values in the input image. These bounds are used
to limit the disparity search interval in the second pass, resulting
in less computation and lower false match probability. The second
correlation pass creates a dense disparity map using large window
correlations. Disparity search intervals in the third and final pass
are constrained to the neighborhood of the disparity calculated in the
previous pass. A single correlator, with different parameters, is used
for the all three passes. Depending on the pass, parameters are
optimized either for speed, percentage of matches or accuracy of the
matches. A texture-based sum-of-absolute-difference (SOAD) correlation
algorithm is used, and the consistency of each match is validated by
doing both a correlation and cross-correlation. Inconsistent matches
are discarded. 

The correlation is followed by a filtering step to remove outlier
matches. Gaps in the disparity map are then filled. Gaps, in general,
are the result of real-world discontinuities in surface shape, such as
the occluding boundaries of rocks in the terrain. In order to retain
these boundaries in the map, gaps occurring at large discontinuities
are filled with the minimum disparity value in the gap
neighborhood. Gaps in regions with small disparity variance are more
likely due to a smooth, texture free surface; these gaps are filled by
averaging. A first-order function is used to offset the disparity
estimates from the correlation phase to account for relative error in
focal lengths between the left and right lens of the stereo pair. 

The final stages derive the final texture-mapped terrain mesh from the
dense disparity step.  First, a local horizontal frame elevation
dotcloud is computed from the dense, filtered disparity map. Range
values in the camera frame are calculated based on pinhole optical
model and CCD imager specifications. These range values are
transformed into the local frame based on a defined reference
transformation defining the camera's pose. This set of points is
converted into a triangle mesh by pairing adjacent camera frame pixels
together. The meshing algorithm preserves discontinuities in the
surface by limiting the depth range of a given triangle. The original
image is then textured onto the mesh.


Accuracy of the models:
-----------------------

distance from origin	3 sigma error on absolute vertex position
	 26.0 m			+/- 2.4 m
	 24.0 m			+/- 2.0 m
	 22.0 m			+/- 1.7 m
	 20.0 m			+/- 1.5 m
	 18.0 m			+/- 1.2 m
	 16.0 m			+/- 0.9 m
	 14.0 m			+/- 0.7 m
	 12.5 m			+/- 0.5 m
	 10.0 m			+/- 0.35 m
	 9.0 m			+/- 0.28 m
	 8.0 m			+/- 0.21 m
	 7.0 m			+/- 0.16 m
	 6.0 m			+/- 0.12 m
	 5.00 m			+/- 0.10 m
	 4.50 m			+/- 0.10 m
	 4.00 m			+/- 0.10 m
	 3.50 m			+/- 0.10 m
	 3.00 m			+/- 0.10 m
	 2.50 m			+/- 0.10 m
	 2.00 m			+/- 0.10 m
	 1.50 m			+/- 0.10 m
	 1.00 m			+/- 0.10 m

Credit: 
------- 

Eric Zbinden, Carol Stoker, Ted Blackmon, Seth Carbon, Paul Henning,
Joel Hagen, Butler Hine, Phil Hontalas, Gloria Hovde, Bob Kanefsky,
Cesar Mina, Charles Neveu, Laurent Nguyen, Boris Rabin, Daryl
Rasmussen, Mike Sims, Kurt Schwehr, Geb Thomas, Hans Thomas, Deanne
Tucker, Suryanto Unsulangi, Nick Vallidis.
 Intelligent Mechanisms Group, NASA Ames Research Center.

Randolf Kirk, Annie Bennett 
 U. S. Geological Survey, Flagstaff Field Center.




