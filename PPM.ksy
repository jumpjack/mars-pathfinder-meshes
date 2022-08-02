meta:
  id: ppm
  file-extension: ppm
  endian: be

seq:
  - id: hdr
    type: header
  - id : image
    type: image_data
types:
  header:
    seq:
      - id: magic
        type: u2
      - id: separator1
        size : 1
      - id : comment
        type: str
        encoding : ASCII
        terminator: 0x0a
      - id : width_height
        type: strnum
        #encoding : ASCII
        #terminator: 0x0a
      - id : depth
        type: str
        encoding : ASCII
        terminator: 0x0a
  image_data:
    seq:
      - id : data
        size : _parent.width * _parent.height * 3
  strnum        :
    seq:
      - id : figure1
        type : u1
      - id : figure2
        type : u1
      - id : figure3
        type : u1
      - id : sep
        size : 1
      - id : figure1a
        type : u1
      - id : figure2a
        type : u1
      - id : figure3a
        type : u1
      - id : term
        size : 1

instances:
  width:
    value: (hdr.width_height.figure1-48)*100 + (hdr.width_height.figure2-48)*10 +  (hdr.width_height.figure3-48)*1
    
  height:
    value: (hdr.width_height.figure1a-48)*100 + (hdr.width_height.figure2a-48)*10 +  (hdr.width_height.figure3a-48)*1
    
    
    