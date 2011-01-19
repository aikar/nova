(function(nova) {
  return {
    span: nova.onRender(function(renderVars, render) {
      render({span: [['Blog Title:', renderVars.title]]});
    })
  };
});