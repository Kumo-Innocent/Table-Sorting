# Table-Sorting
Sort HTML table using JS. Click the head column to change order of sort.

This is a little JS library to sort HTML tables by columns, ASC or DESC.

## Init
The initialisation is very easy !
```HTML
<div id="kumo-listing-container">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Country</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Karen</td>
        <td>U.S.A</td>
      </tr>
      <tr>
        <td>Emilio</td>
        <td>Brasil</td>
      </tr>
    </tbody>
  </table>
</div>

<script src="./kumo-table-sort.js"></script>
<script>
    ( () => {
        kumo_table_sort
            .setTable( '#kumo-listing-container table' )
            .getLines()
            .getHeader();
    } )();
</script>
```

-----
This is a first version ! It can be improved _(firstly, by using TypeScript)_.
