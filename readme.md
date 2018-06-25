# jquery.spreadOut
Spreads out children elements in a parent in a pseudo-random (natural looking) way.

*Usage*
$('selector').spreadOut({});

*Options*
You can add parameters to the options object:

* childSelector - specify a selector to only grab specific children elements. Defaults to '.child'
* avoidOtherChildren - specify whether non-selected children should be avoided (i.e. dont place items on top if possible) Defaults to false

*Notes*

* The algorithm begins by not allowing overlaps. If it fails to find a spot, it will allow overlaps and try again (and allow overlaps for all future children)
* There are currently a lot of areas for potential improvement
  * Each child currently assumes other children are the same size
  * Distances are currently calculated from centerpoints instead of edges
  * Algorithms have not been optimized for speed
  
Feel free to help in any of these areas.