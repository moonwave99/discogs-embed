#global module:false

"use strict"

module.exports = (grunt) ->
  
  require('load-grunt-tasks')( grunt )
  
  grunt.initConfig  
  
    clean:
      [
        'assets'
      ]
        
    less: 
      bootstrap: 
        options:
          paths: ['node_modules/bootstrap/less']
        files: 
          "assets/css/bootstrap.css" : [
            "_styles/less/bootstrap.less"
          ]
          
    concat: 
      css: 
        src: [
          'assets/css/bower_vendor.css'
          'assets/css/bootstrap.css'
          'assets/css/discogs.css'
        ]
        dest: 'assets/css/discogs-embed.css'
  
    bower_concat: 
      all: 
        dest: 'assets/js/bower_vendor.js'
        cssDest: 'assets/css/bower_vendor.css'       

    stylus: 
      compile: 
        options: 
          paths: ['_styles/styl']
          urlfunc: 'embedurl'
          import: [
            './../../node_modules/nib/index.styl'
          ]
        files: 
          'assets/css/discogs.css': '_styles/styl/app.styl'
      
    uglify:
      app:
        files:
          'assets/js/discogs-embed.min.js': [
            'assets/js/bower_vendor.js'
            'assets/js/templates/discogs-embed.js'
            'discogs-embed.js'
          ]
        
    cssmin:
      combine:
        files:
          'assets/css/discogs-embed.min.css': ['assets/css/discogs-embed.css']
          
    handlebars:
      compile:
        options:
          namespace: "discogsEmbed.templates"
          processName: (filePath) ->
            return filePath.split('/').pop().replace('.hbs', '')

        files:
          "assets/js/templates/discogs-embed.js": "_templates/**/*.hbs"
          
    watch:
      options:
        spawn : false
        interrupt : true
        atBegin : true       
        livereload: true
      source:
        files: [
          "_styles/styl/**/*"
          "_templates/**/*"
          "discogs-embed.js"
        ]
        tasks: [
          "bower_concat"
          "less:bootstrap"
          "stylus"
          "concat"
          "cssmin"
          "handlebars"
          "uglify"
        ]

  grunt.registerTask "build", [
    "copy"
    "bower_concat"
    "less:bootstrap"
    "stylus"
    "concat"
    "cssmin"
    "handlebars"
    "uglify"    
    "clean"
  ]