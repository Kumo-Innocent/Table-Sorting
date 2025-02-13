const kumo_table_sort = {
    sort: '',
    descending: false,
    table: null,
    lines: null,
    object_lines: null,
    sorted_object_lines: null,
    head_lines: null,
    object_head_lines: null,
    active_head_line: null,
    line_selector: 'td.py-4.px-2',
    svg_element: ( new DOMParser() ).parseFromString( `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.375 6.22l-4.375 3.498l-4.375 -3.5a1 1 0 0 0 -1.625 .782v6a1 1 0 0 0 .375 .78l5 4a1 1 0 0 0 1.25 0l5 -4a1 1 0 0 0 .375 -.78v-6a1 1 0 0 0 -1.625 -.78z" stroke-width="0" fill="currentColor" /></svg>`, 'image/svg+xml' ).children[ 0 ],
    setSortedValues: function( lines, changeOrder=true ) {
        this.sorted_object_lines = lines;
        if( changeOrder ) return this.setOrder();
        window.dispatchEvent( new Event( 'kumo-filter-sorted-manual-set' ) );
        return this;
    },
    getSortValues: function( changeOrder=true ) {
        if( this.sort === '' || this.object_lines === null ) return this;
        this.sorted_object_lines = ( temp = [...this.object_lines].sort( ( a, b ) => {
            const first = a.elements[ this.sort ];
            const second = b.elements[ this.sort ];
            if( first < second ) return -1;
            if( first > second ) return 1;
            return 0;
        } ) ) && this.descending ? temp.reverse() : temp;
        if( changeOrder ) return this.setOrder();
        window.dispatchEvent( new Event( 'kumo-filter-values-sorted' ) );
        return this;
    },
    setOrder: function( toInsert=null ) {
        this.changeSVG();
        const tbody = this.table.querySelector( 'tbody' );
        [...this.table.querySelectorAll( 'tbody tr' )].forEach( item => item.remove() );
        if( Array.isArray( toInsert ) ) toInsert.forEach( item => tbody.appendChild( item.base ) );
        else this.sorted_object_lines.forEach( item => tbody.appendChild( item.base ) );
        window.dispatchEvent( new Event( 'kumo-filter-order-set' ) );
        return this;
    },
    changeSVG: function() {
        if( ! this.descending ) this.active_head_line?.base.querySelector( 'svg' )?.classList.add( 'rotate-180' );
        else this.active_head_line?.base.querySelector( 'svg' )?.classList.remove( 'rotate-180' );
        window.dispatchEvent( new Event( 'kumo-filter-svg-changed' ) );
        return this;
    },
    toggleDescending: function() {
        this.descending = ! this.descending;
        window.dispatchEvent( new Event( 'kumo-filter-toggle-descending' ) );
        return this;
    },
    setSort: function( sort, changeOrder=true ) {
        if( this.active_head_line !== null ) {
            this.active_head_line?.base.classList.add( 'inline-flex', 'items-center', 'gap-2' );
            this.active_head_line?.base.appendChild( this.svg_element );
        }
        if( this.sort == sort ) this.toggleDescending();
        this.sort = sort;
        if( changeOrder ) return this.getSortValues();
        window.dispatchEvent( new Event( 'kumo-filter-sort-set' ) );
        return this;
    },
    setLineSelector: function( selector ) {
        this.line_selector = selector;
        window.dispatchEvent( new Event( 'kumo-filter-line-selector' ) );
        return this;
    },
    translateLines: function() {
        let temp = [];
        if( this.table === null ) {
            console.error( 'Please set table before getting lines' );
        } else {
            this.lines = [...this.table.querySelectorAll( 'tbody tr' )];
            if( this.lines.length !== 0 ) {
                temp = this.lines.map( item => ( {
                    base: item,
                    elements: [...item.querySelectorAll( this.line_selector )].map( sub => ( { [ sub.dataset.target ]: sub.innerText } ) ).reduce( ( acc, obj ) => {
                        for( let key in obj ) {
                            let temp_match;
                            if( ! isNaN( obj[ key ] ) ) {
                                acc[ key ] = parseInt( obj[ key ] );
                            } else if( ( temp_match = obj[ key ].match( /(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})/i ) ) ) {
                                acc[ key ] = `${ temp_match.groups.year }-${ temp_match.groups.month }-${ temp_match.groups.day }`;
                            } else {
                                acc[ key ] = obj[ key ];
                            }
                        }
                        return acc;
                    }, {} )
                } ) );
            }
        }
        return temp;
    },
    getLines: function( setLines=true, concat=true ) {
        if( this.table === null ) {
            console.error( 'Please set table before getting lines' );
        } else {
            let temp = this.translateLines();
            if( temp.length !== 0 ) {
                if( setLines ) this.object_lines = temp;
                this.sorted_object_lines = temp;
                if( ! setLines ) {
                    let not_in_lines = [];
                    let all_lines_elements = this.object_lines.map( item => JSON.stringify( item.elements ) );
                    this.sorted_object_lines.forEach( item => {
                        let temp = JSON.stringify( item.elements );
                        if( ! all_lines_elements.includes( temp ) ) not_in_lines.push( item );
                    } );
                    if( concat ) this.object_lines = [ ...this.object_lines, ...not_in_lines ];
                    else this.object_lines = [ ...not_in_lines ];
                }
            }
        }
        window.dispatchEvent( new Event( 'kumo-filter-lines-get' ) );
        return this;
    },
    setHeaderReduced: function( number=3 ) {
        if( this.object_head_lines === null || this.object_lines === null ) return this;
        this.object_head_lines = this.object_head_lines.slice( number )
        this.object_lines = this.object_lines.map( item => ( {
            base: item.base,
            elements: Object.fromEntries( Object.entries( item.elements ).slice( number ) )
        } ) );
        this.sorted_object_lines = this.object_lines;
        window.dispatchEvent( new Event( 'kumo-filter-header-reduced' ) );
        return this;
    },
    getHeader: function( cantEmpty=false ) {
        if( this.table === null ) {
            console.error( 'Please set table before getting lines' );
        } else {
            this.head_lines = [...this.table.querySelectorAll( 'thead tr th' )];
            if( this.head_lines.length !== 0 ) {
                if( this.object_lines !== null ) {
                    const keys = Object.keys( this.object_lines[ 0 ].elements );
                    this.object_head_lines = this.head_lines.filter( item => keys.includes( item.dataset.target ) ).map( ( item, index ) => ( {
                        [ keys[ index ] ]: item.innerText,
                        base: item,
                        sort: keys[ index ]
                    } ) );
                } else this.object_head_lines = this.head_lines.map( item => item.innerText );
                if( cantEmpty && this.object_lines === null ) return;
                this.object_head_lines.forEach( item => {
                    if( item?.base?.dataset?.hasOwnProperty( 'noFilter' ) ?? true ) return;
                    item.base.addEventListener( 'click', () => {
                        if( this.active_head_line !== null ) {
                            this.active_head_line?.base.classList.remove( 'inline-flex', 'items-center', 'gap-2' );
                        }
                        this.active_head_line = item;
                        this.setSort( item.sort );
                    } )
                } );
            }
        }
        window.dispatchEvent( new Event( 'kumo-filter-header-get' ) );
        return this;
    },
    setTable: function( selector ) {
        if( selector instanceof HTMLElement ) this.table = selector;
        else {
            this.table = document.querySelector( selector );
        }
        window.dispatchEvent( new Event( 'kumo-filter-table-set' ) );
        return this;
    },
    resetTable: function() {
        if( this.active_head_line !== null ) {
            this.active_head_line?.base.classList.remove( 'inline-flex', 'items-center', 'gap-2' );
            this.active_head_line?.base.querySelector( 'svg' )?.remove();
        }
        let to_return = this;
        if( this.object_lines !== null && Array.isArray( this.object_lines ) ) to_return = this.setOrder( this.object_lines );
        window.dispatchEvent( new Event( 'kumo-filter-reset-done' ) );
        return to_return;
    }
};
