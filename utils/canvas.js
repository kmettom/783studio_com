import {gsap} from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother.js";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import scrollFragment from './shaders/scrollFragment.glsl';
import scrollVertex from './shaders/scrollVertex.glsl';
import defaultFragment from './shaders/defaultFragment.glsl';
import defaultVertex from './shaders/defaultVertex.glsl';
import projectFragment from './shaders/projectFragment.glsl';
import projectVertex from './shaders/projectVertex.glsl';

let Canvas = {
    scrollPosition: 0,
    scrollInProgress : false,
    container : null,
    pointer : {cursor: null , intersects: null },
    time: 0,
    scene: new THREE.Scene(),
    materials: [],
    imageStore: [],
    scroller: null,
    currentScroll: 0,
    options: {
        default:{
            fragmentShader: defaultFragment,
            vertexShader: defaultVertex,
        },
        project: {
            fragmentShader: projectFragment,
            vertexShader: projectVertex,
      },
    },
    init(_canvasElement) {
        this.container = _canvasElement;

        gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

        this.scroller = ScrollSmoother.create({
            wrapper: "#smooth-wrapper",
            container: "#smooth-content",
            smooth: 1,
            effects: false,       // enable Data-set effects (default is false)
            smoothTouch: 0.1,        // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
            onUpdate: (_data) => {
                this.scrollPosition = _data.progress;
            },
        });

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera = new THREE.PerspectiveCamera( 70, this.width/this.height, 100, 2000 );
        this.camera.position.z = 600; // 600

        this.camera.fov = 2*Math.atan( (this.height/2)/600 )* (180/Math.PI);

        this.renderer = new THREE.WebGLRenderer({
            // antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio , 1.5));

        // SHADOW
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild( this.renderer.domElement );

        // this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        // this.raycaster = new THREE.Raycaster();
        this.pointer.cursor = new THREE.Vector2();

        this.setSize();

        // this.setLight()

        this.composerPass()

        this.render();

        window.addEventListener('pointermove', (event) => {
            this.pointer.cursor.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.pointer.cursor.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        });

        // this.render();

    },
    setImageMeshPositions(){
        if(!this.imageStore) return;

        for (var i = 0; i < this.imageStore.length ; i++) {

            if(
                this.currentScroll < this.imageStore[i].top + this.imageStore[i].height
                && this.imageStore[i].top  < this.currentScroll + this.height
            ){
                this.imageStore[i].mesh.position.x = ( this.imageStore[i].left - this.width/2 + this.imageStore[i].width/2);
                this.imageStore[i].mesh.position.y =  ( this.currentScroll - this.imageStore[i].top + this.height/2 - this.imageStore[i].height/2);
            }
            else {
                this.imageStore[i].mesh.position.y = this.height*2;
            }


        }
    },

    addImage(_img, _type) {
        let meshIndex = this.imageStore.length;

        let id = `meshImage${_type}_${meshIndex}`;
        let fragmentShader= this.options.default.fragmentShader;
        let vertexShader = this.options.default.vertexShader;

        if(_type){
            fragmentShader = this.options[_type].fragmentShader;
            vertexShader = this.options[_type].vertexShader;
        }

        let geometry;
        let bounds = _img.getBoundingClientRect();
        let position = { top : bounds.top , left: bounds.left};
        position.top += this.currentScroll;

        geometry = new THREE.PlaneGeometry( bounds.width , bounds.height );

        let texture = new THREE.Texture(_img);
        texture.needsUpdate = true;

        let material = new THREE.ShaderMaterial({
            uniforms:{
                time: {value:0},
                uImage: {value: texture},
                vectorVNoise: {value: new THREE.Vector2( 1.5 , 1.5 )}, // 1.5
                vectorWave: {value: new THREE.Vector2( 0.5 , 0.5 )}, // 0.5
                hoverState: {value: 0},
                cursorPositionX: {value: 0},
                cursorPositionY: {value: 0},
                aniIn: {value: 0},
                aniOut: {value: 0},
                aniOutToArticle: {value: 0},
                aniInImageGallery: {value: 0},
                aniOutImageGallery: {value: 0},
                galleryActive: {value: 0},
            },
            fragmentShader: fragmentShader,
            vertexShader: vertexShader,
            transparent: true,
            name: `meshImage${_type}`,
            // opacity: 0.1,
            // side: THREE.DoubleSide,
            // wireframe: true
        });

        this.materials.push(material);

        let mesh = new THREE.Mesh( geometry, material );
        mesh.name =  id;

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const newMesh = {
            name:id,
            img: _img,
            mesh: mesh,
            top: position.top,
            left: position.left,
            width: bounds.width,
            height: bounds.height,
            thumbOutAction: {value: 0},
        }

        this.imageStore.push(newMesh);
        // this.meshMouseListeners(newMesh, material);
        // this.meshAniIn(newMesh, material, _type);

        gsap.to(material.uniforms.aniIn , {
            duration: 1.25,
            value: 1
        })

        // this.scroll.setSize();

        this.setImageMeshPositions();

    },
    composerPass(){
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        //custom shader pass
        // var counter = 0.0;
        this.myEffect = {
            uniforms: {
                "tDiffuse": { value: null },
                "scrollSpeed": { value: null },
            },
            vertexShader: scrollVertex,
            fragmentShader: scrollFragment,
        }

        this.customPass = new ShaderPass(this.myEffect);
        this.customPass.renderToScreen = true;

        this.composer.addPass(this.customPass);
    },
    setSize(){
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera.aspect = this.width/this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( this.width,this.height );
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.render(this.scene, this.camera); // -> Also needed
    },
    render() {

        this.time+=0.05;

        // this.scroll.render();
        // this.scroll.scrollToRender;

        this.scrollInProgress = this.scrollPosition * this.height !== this.currentScroll;
        this.currentScroll = this.scrollPosition * this.height;


        // if(this.resizeInProgress ) {
        //   this.resetImageMeshPosition();
        // }

        //animate on scroll
        if(
            this.scrollInProgress
        ){
            this.customPass.uniforms.scrollSpeed.value = 0;
            // this.customPass.uniforms.scrollSpeed.value = this.scroll.speedTarget;
            this.setImageMeshPositions();
        }

        //animate on hover
        for (var i = 0; i < this.materials.length; i++) {
            this.materials[i].uniforms.time.value = this.time;
        }

        // this.checkGalleryImageHovers()

        this.composer.render()



        window.requestAnimationFrame(this.render.bind(this));

    },

}

export {Canvas};

