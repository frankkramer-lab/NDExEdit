# NDExEdit

Networks are crucial in biological research! 
But there is a natural void between desktop clients to create, edit and beautify a network, and web apps to distribute them: NDExEdit aims to fill that void. 
Try the [demo](https://frankkramer-lab.github.io/NDExEdit/) to see how web-based editing of a network could look like.

NDExEdit is a web-based application where simple changes can be made to biological networks within the browser. 
The web tool is designed to conform to the [CX (Cytoscape Exchange) data model](https://home.ndexbio.org/data-model/), which is used for data transmission by both, [Cytoscape](https://cytoscape.org/) and [NDEx](https://www.ndexbio.org/). 
Therefore the modified network can be exported as a compatible CX-file, additionally to standard image formats like PNG and JPEG.

To edit a network the user can either load a network directly from NDEx into the app or use a local CX-file. 
Since the network data is only stored locally within the web browser, users can edit their private networks without concerns of unintentional publication.

For users unfamiliar with the network, NDExEdit offers some tools that may facilitate the process. 
The statistics view provides distribution and coverage charts for each attribute within the network. 
With that assistance, existing attribute-to-visual-mappings can be removed or edited, and new mappings created. 
Furthermore, the inspection wizard allows the user to select certain elements or define matching criteria to be highlighted within the network.  

## First steps

If you never worked with NDExEdit before, here are a few first steps you might want to try out:

- Visit the [NDExBIO](http://www.ndexbio.org/#/) Website and select a network you would like to edit visually
- Enter this network's URL or UUID into the downloader under "Manage" or select a local .cx file
- Inspect the information displayed to this specific network by clicking on the i-Icon right next to the networks name
- Click on "Edit" to manipulate how the graph is displayed
- You can download the adapted graph as .cx file

## See also

For interfacing with NDEx, and working with and networks in CX format in a programatic manner, there exist clients several clients:
- R:
  - interface with NDEx: [NDExR](https://doi.org/doi:10.18129/B9.bioc.ndexr) on Bioconductor
  - working with CX: [RCX](https://github.com/frankkramer-lab/RCX) on GitHub (under review on Bioconductor)
- python: [ndex2](https://ndex2.readthedocs.io/en/latest/)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE Version 3.
See the LICENSE.md file for license rights and limitations.
