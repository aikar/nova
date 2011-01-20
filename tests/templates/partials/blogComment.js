(function(nova) {
  return {
    span: [{'class':'parentSpan'}, nova.onRender(function(renderVars, render) {
      render({span: [['Blog Title:', renderVars.title]]});
    })]
  };
});