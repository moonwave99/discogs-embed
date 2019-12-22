(function($){

  var discogs, defaultOptions, __bind;

  __bind = function(fn, me) {
    return function() {
      return fn.apply(me, arguments);
    };
  };

  // Plugin default options.
  defaultOptions = {
    api: {
      baseUrl: 'https://api.discogs.com',
      extension: ''
    },
    token: null,
    imageCacheUrl: '/images/discogs',
    ui: {
      collapseThreshold: 10
    }
  };

  defaultDiscogsOptions = {
    releaseType: 'releases',
    id: 1990898
  };

  discogs = (function(options) {

    function discogs(handler, options) {

      var _this = this;
      // plugin variables.
      this.handler = handler;

      // Extend default options.
      $.extend(true, this, defaultOptions, options);

      // Bind methods.
      this.init = __bind(this.init, this);
      this.load = __bind(this.load, this);
      this.clear = __bind(this.clear, this);
      this.expand = __bind(this.expand, this);
      this.reload = __bind(this.reload, this);
      this._done = __bind(this._done, this);
      this._fail = __bind(this._fail, this);
      this._always = __bind(this._always, this);

      // Assign templates.
      this.templates = window.discogsEmbed.templates;

      // Register Handlebars helpers.
      Handlebars.registerHelper('isCollapsed', function(tracklist, opts) {
        return tracklist.length > _this.ui.collapseThreshold ? opts.fn(this) : null;
      });

      Handlebars.registerHelper('isTrack', function(track, opts) {
        return track.type_ == 'track' ? opts.fn(this) : opts.inverse(this);
      });

      // Load data handlers.
      var _this = this;
      this._done = function(result, status, jqXHR){
        result.data.image = _this.imageCacheUrl + '/' + result.data.id + '.jpeg';
        _this.handler
          .toggleClass('error', false)
          .html(_this.templates.main({
            data: result.data
          }))
          .addClass('loaded');
      }

      this._fail = function(){
        _this.handler.toggleClass('error', true).html(_this.templates.error({
          id : _this.discogsData.id
        }));
      }

      this._always = function(){
        _this.handler.toggleClass('loading', false);
      }

    };

    discogs.prototype.expand = function(event){
      event.preventDefault();
      var $tracklist = this.$tracklist || (this.$tracklist = this.handler.find('.tracklist'));
      $tracklist
        .toggleClass('collapsed', !$tracklist.is('.collapsed'))
        .find('ul')
        .toggleClass('ellipsed', !!$tracklist.is('.collapsed'));
    }

    discogs.prototype.reload = function(event){
      event.preventDefault();
      this.load();
    }

    discogs.prototype.load = function(){
      var requestUrl = [
        this.api.baseUrl,
        this.discogsData.releaseType,
        this.discogsData.id
      ].join('/');
      var data = {};
      if (this.token) {
        data.token = this.token;
      }
      if (this.requestFormat == 'jsonp') {
        data.callback = '?'
      }

      this.handler.toggleClass('loading', true);
      return $.getJSON(requestUrl  + this.api.extension, data)
        .done(this._done)
        .fail(this._fail)
        .always(this._always);
    }

    // Main method.
    discogs.prototype.init = function() {
      var _this = this;
      this.discogsData = $.extend(true, defaultDiscogsOptions, this.handler.data());
      this.handler.on('click', '.more', this.expand);
      this.handler.on('click', '.reload', this.reload);
      this.handler.addClass('discogs-embed');
      this.load();
    };

    // Clear event listeners and time outs.
    discogs.prototype.clear = function() {
      this.handler.off('click');
    };

    return discogs;
  })();

  $.fn.discogs = function(options) {
    // Create a myPlugin instance if not available.
    if (!this.myPluginInstance) {
      this.myPluginInstance = new discogs(this, options || {});
    } else {
      this.myPluginInstance.update(options || {});
    }

    // Init plugin.
    this.myPluginInstance.init();

    // Display items (if hidden) and return jQuery object to maintain chainability.
    return this.show();
  };
})(jQuery, Handlebars);
