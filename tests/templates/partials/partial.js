(function(nova) {
  return {
    span: [ {'class': 'onRenderPartial'},[
      nova.onRender(function(number, render) {

        //console.log('<<<',arguments,'1:', number, '2:', render);
        
        render(3 * number);
      })
    ]]
  };
});