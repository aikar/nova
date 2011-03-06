(function (nova) {
 return {
  div: [
   [{
    h1: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header);
    })]]
   },
   {
    h2: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header2);
    })]]
   },
   {
    h3: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header3);
    })]]
   },
   {
    h3: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header3);
    })]]
   },
   {
    h4: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header4);
    })]]
   },
   {
    h5: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header5);
    })]]
   },
   {
    h6: [{
     'class': 'header1'
    }, [nova.onRender(function(v, r) {
     r(v.header6);
    })]]
   },
   {
    ul: [{
     'class': 'list'
    }, [
    nova.onRender(function(v, r) {
     r(nova.partial('partials/jsperfpartial', v.list));
    })]]
   }]
  ]
 }
})
