// Generated by CoffeeScript 1.4.0
(function() {
  var FPS, H, NB_FRAMES, W, chainAsync, clear_depth_map, createAnimation, depth_map_sketch, download, main, runWiggle, setupToolbox, upload_image;

  NB_FRAMES = 8;

  FPS = 20;

  W = 300;

  H = 200;

  runWiggle = function() {
    var _ref;
    if ((_ref = window.animation) != null) {
      _ref.stop();
    }
    window.animation = createAnimation();
    return window.animation.play($("#result")[0], FPS);
  };

  createAnimation = function() {
    var $canvas, $image, cameras, depth, i, img, theta, thetas;
    $image = $("#editor > img");
    $canvas = $("#editor > canvas");
    stackBlurCanvasRGB($canvas[0], 0, 0, W, H, 20.0);
    img = wiggle.extract_image_data($image[0]);
    depth = $canvas[0].getContext('2d').getImageData(0, 0, W, H);
    thetas = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= NB_FRAMES ? _i < NB_FRAMES : _i > NB_FRAMES; i = 0 <= NB_FRAMES ? ++_i : --_i) {
        _results.push(Math.PI * 2.0 * i / NB_FRAMES);
      }
      return _results;
    })();
    cameras = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = thetas.length; _i < _len; _i++) {
        theta = thetas[_i];
        _results.push(wiggle.camera_from_angle(60.0, theta));
      }
      return _results;
    })();
    return wiggle.compute_animation(img, depth, cameras);
  };

  setupToolbox = function() {
    var brush_attr;
    brush_attr = {
      brush: 40,
      color: "medium"
    };
    return $("div.toolbox div").click(function() {
      var cursor_css, cursor_url, k, offset, v, _ref;
      _ref = $(this).attr('class').split("-"), k = _ref[0], v = _ref[1];
      brush_attr[k] = v;
      offset = brush_attr.brush / 2;
      cursor_url = "../img/cursor_" + brush_attr.brush + "_" + brush_attr.color + ".png";
      cursor_css = "url('" + cursor_url + "') " + offset + " " + offset + ", pointer";
      return $("#editor canvas").css("cursor", cursor_css);
    });
  };

  chainAsync = function(operations, cb) {
    var head;
    if (operations.length === 0) {
      return cb();
    } else {
      head = operations.shift();
      head();
      return setTimeout((function() {
        return chainAsync(operations, cb);
      }), 0);
    }
  };

  clear_depth_map = function() {
    var depth_map;
    depth_map = $('#editor-canvas').sketch();
    depth_map.actions = [];
    return depth_map.redraw();
  };

  depth_map_sketch = function() {
    return $('#editor-canvas').sketch({
      defaultSize: 40,
      defaultColor: "#999"
    });
  };

  download = function() {
    var $progress, canvas, ctx, encoder, frame, i, operations, _fn, _i, _len, _ref;
    $("body").addClass("downloading");
    runWiggle();
    encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(1000.0 / FPS);
    encoder.setSize(W, H);
    encoder.start();
    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    i = 0;
    $progress = $("progress.download");
    operations = [];
    _ref = animation.frames;
    _fn = function(frame) {
      return operations.push(function() {
        $progress.val(i++);
        ctx.putImageData(frame, 0, 0);
        return encoder.addFrame(ctx);
      });
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      frame = _ref[_i];
      _fn(frame);
    }
    return chainAsync(operations, function() {
      var downloadLink;
      encoder.finish();
      downloadLink = document.createElement('a');
      downloadLink.href = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
      downloadLink.download = "wiggle.gif";
      downloadLink.click();
      return $("body").removeClass("downloading");
    });
  };

  upload_image = function() {
    var $file_input, $img;
    $file_input = $("<input type='file'>");
    $file_input.click();
    $img = $('#editor > img');
    return $file_input.change(function() {
      var file;
      if ($file_input[0].files.length === 0) {
        return;
      }
      file = $file_input[0].files[0];
      $img.attr('src', URL.createObjectURL(file));
      clear_depth_map();
      return runWiggle();
    });
  };

  main = function() {
    var $img;
    $('#process-upload').click(upload_image);
    depth_map_sketch();
    $img = $('#editor > img');
    $img.load(depth_map_sketch);
    $('#process-button').click(runWiggle);
    $(runWiggle);
    setupToolbox();
    return $('#download-button').click(download);
  };

  $(main);

}).call(this);
