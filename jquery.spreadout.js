// jquery.spreadout 
// taylor morgan
// v0.21
// tmdesigned.com 

(function( $ ){
   $.fn.spreadOut = function( opts ) {
      
      this.childSelector = opts.hasOwnProperty( 'childSelector' ) ? opts.childSelector : '.child';
      this.avoidOtherChildren = opts.hasOwnProperty( 'avoidOtherChildren' ) ? opts.avoidOtherChildren : false;

      this.widthOfGrid = $(this).width();
      this.heightOfGrid = $(this).height();
      this.allowOverlap = false; //set to true automatically when can't find a match
      this.avoidRects = [];
      this.rows = [];
      this.samples = []; //chosen centers for quick distance calcs

      this.init = function(){
         $(this).css( { 'position': 'relative' } );
         this.allowOverlap = false;
         this.rows = [];
         for ( var i = 0; i < this.heightOfGrid; i++ ){
            var col = [];
            for ( var l = 0; l < this.widthOfGrid; l++ ){
               col.push({ occupied:false });
            }
            this.rows.push(col);
         }
         this.loopThroughChildren();
      };
      
      this.loopThroughChildren = function(){
         if( this.avoidOtherChildren ){
           
            var avoidChildren = $(this).children().not( this.childSelector );
            for ( var i = 0; i < avoidChildren.length; i ++ ){
               var avoidRect = new this.myRect( avoidChildren[0].offsetLeft, avoidChildren[0].offsetTop, $(avoidChildren[0]).width(), $(avoidChildren[0]).height() );
               this.avoidRects.push( avoidRect );
               console.log('avoiding...',avoidChildren[0].offsetLeft, avoidChildren[0].offsetTop, $(avoidChildren[0]).width(), $(avoidChildren[0]).height());
            }
         }
         
         var children = $(this).find( this.childSelector );
         for ( var i = 0; i < children.length; i ++ ){
            this.choose( children[i] );
         }
         

      }
      
      this.update = function(){
         this.init();
      }
      
      this.myRect = function(x, y, w, h) {

          this.x = x;
          this.y = y;
          this.width = w;
          this.height = h;

          this.contains = function (x, y) {
             //console.log('seeing if',this.x,'-',this.x+this.width,'x',this.y,'-',this.y+this.height,'contains',x,y);
              return this.x <= x && x <= this.x + this.width &&
                     this.y <= y && y <= this.y + this.height;
         }
      }
      
      this.choose = function( child ){

         var best = this.findBestCandidate(child);
        if( typeof best == 'undefined' ){
           this.allowOverlap = true;
        }
        best = this.findBestCandidate(child);
        this.claimSpot( child, best[0],best[1] ); 

      }
      
      this.findBestCandidate = function(child){

           var bestCandidate, bestDistance = 0;
           for (var i = 0; i < 40; ++i) {
             var c = [ Math.floor(Math.random() * this.rows[0].length), Math.floor( Math.random() * this.rows.length)];
              //console.log('------',i,') checking if',c[0],c[1],'is a good center...');
             if( !this.isValidSpot ( child, c[0],c[1] ) ){
                continue;
             }
             var d = this.findClosest(c), c;
             if (d >= bestDistance ) {
               bestDistance = d;
               bestCandidate = c;
             }
           }
           return bestCandidate;
      };
      
      this.distance = function(a,b){
        var dx = a[0] - b[0],
            dy = a[1] - b[1];
        return Math.sqrt(dx * dx + dy * dy);
      };
      
      this.findClosest = function(a){
         var closestDistance = 0;
         for ( var i = 0; i < this.samples.length; i++ ){
            var d = this.distance( a, [this.samples[i].x, this.samples[i].y] );
            if ( closestDistance == 0 || d < closestDistance ){
               closestDistance = d;
            }
         }
         return closestDistance;
      }
      
      this.isValidSpot = function( child, x, y ){
        //for now, incorrectly assuming all other items' dimensions match this one's
         //console.log('---------X:',x,'Y:',y,'childWidth:',$(child).width(),'childHeight:',$(child).height());
         var leftBound = Math.floor(x - (parseInt( $(child).width() ) / 2 ));
        var rightBound = Math.floor(x + (parseInt( $(child).width() ) / 2 ));
        var topBound = Math.floor(y - (parseInt( $(child).height() ) / 2 ));
        var bottomBound = Math.floor(y + (parseInt( $(child).height() ) / 2 ));
         //console.log('---------bounds:',leftBound,rightBound,topBound,bottomBound);
         
         //If avoiding other elements, run through those first
         if( this.avoidOtherChildren ){
            for ( var i = 0; i < this.avoidRects.length; i++ ){
               if ( this.avoidRects[i].contains( leftBound, topBound) ||
                  this.avoidRects[i].contains( rightBound, topBound ) || 
                  this.avoidRects[i].contains( leftBound, bottomBound ) || 
                  this.avoidRects[i].contains( rightBound, bottomBound ) ){
                  return false;
               }
            }
         }
         
         
        if( this.allowOverlap ){
           if( leftBound < 0 || 
           topBound < 0 || 
           rightBound >= parseInt(this.widthOfGrid) ||
           bottomBound >= parseInt(this.heightOfGrid) ||
           this.rows[y][x].occupied ){
              return false;
           }else{
              return true;
           }
        }else{
        if( leftBound < 0 || 
           topBound < 0 || 
           rightBound >= parseInt(this.widthOfGrid) ||
           bottomBound >= parseInt(this.heightOfGrid) ||
           this.rows[ topBound ][ leftBound ].occupied ||
           this.rows[ bottomBound ][ leftBound ].occupied ||
           this.rows[ topBound ][ rightBound ].occupied ||
           this.rows[ bottomBound][ rightBound ].occupied ){ 
           
           return false;
        }
         return true;
        }
        
      };
      
       this.claimSpot = function( child, x,y ){
         var halfWidth = parseInt( $(child).width() ) / 2;
         var halfHeight = parseInt( $(child).height() ) / 2;
         var xStart = Math.floor( x - halfWidth );
         var yStart = Math.floor( y - halfHeight );
         for( var i = xStart; i < xStart + parseInt($(child).width()); i++ ){
            for( var j = yStart; j < yStart + parseInt($(child).height()); j++ ){
               this.rows[j][i].occupied = true;
            }
         }
         $(child).css({ 'position':'absolute', 'top':yStart, 'left':xStart } );
         //$(child).data( 'top', yStart).data( 'left',xStart).data('right',x + halfWidth).data( 'bottom', y + halfHeight); //for debugging
         this.samples.push({x:x,y:y});
      },
      
      this.init();
      
      
      
      return this;
   }; 
})( jQuery );