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
        terminator: 0x0A
      - id : width
        type: str
        encoding : ASCII
        terminator: 0x20
      - id : height
        type: str
        encoding : ASCII
        terminator: 0x0a
      - id : depth
        type: str
        encoding : ASCII
        terminator: 0x0a
  image_data:
    seq:
      - id : data
        size : _parent.width.to_i(10) * _parent.height.to_i(10) * 3
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
    value: hdr.width
    
  height:
    value: hdr.height
