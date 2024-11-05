import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

let container, stats;
let camera, cameraTarget, scene, renderer;
let cameraMove = false;

const progressTxt = document.getElementById( 'progress' );

container = document.createElement( 'div' );
document.body.appendChild( container );

camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 1500 );
camera.position.set( 3, 0.15, 5 );

cameraTarget = new THREE.Vector3( 0, - 0.25, 0 );

scene = new THREE.Scene();
scene.background = new THREE.Color( 0x72645b );
scene.fog = new THREE.Fog( 0x72645b, 2, 15 );


// Ground

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry( 400, 400 ),
    new THREE.MeshPhongMaterial( { color: 0xcbcbcb, specular: 0x474747, transparent: true, opacity: .5 } )
);
plane.rotation.x = - Math.PI / 2;
plane.position.y = - 0.5;
scene.add( plane );

plane.receiveShadow = true;


const geometry4 = new THREE.PlaneGeometry( 400, 400 );
//const geometry5 = new THREE.CircleGeometry( 40, 64 );
const groundMirror = new Reflector( geometry4, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xb5b5b5,
} );
groundMirror.position.y = -0.501;
groundMirror.rotateX( - Math.PI / 2 );
scene.add( groundMirror );


const loadingManager = new THREE.LoadingManager( () => {
	
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );
    
    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
    
});


// LOAD'EM UP!
const loader = new STLLoader(loadingManager);
let mesh;
window.loadEmUp = function(model) {
    // if(mesh)
    //     scene.remove( mesh );
    let fileName;
    if( model == 1) 
        fileName = './vases/Vase.stl';
    if( model == 2) 
        fileName = './vases/Vase_fixed.stl';
    if( model == 3) 
        fileName = './vases/Vase-3-WM.stl';
    if( model == 5) 
        fileName = './vases/Vase-5-WM.stl';

    loader.load( fileName, function ( geometry ) {
        let material;
        if(model == 2 || model == 1) 
            material = new THREE.MeshPhongMaterial( { color: 0xff9c7c, specular: 0x494949, shininess: 200, side: THREE.DoubleSide } );
        else
            material = new THREE.MeshPhongMaterial( { color: 0xff9c7c, specular: 0x494949, shininess: 200} );

        mesh = new THREE.Mesh( geometry, material );

        if(model ==  1) {
            //VASE 1
            mesh.position.set( 0, 0.92, 0 );
            // mesh.rotation.set( 0, - Math.PI / 2, 0 );
            mesh.rotation.x = -Math.PI / -2;
            mesh.scale.set( 0.3, 0.3, 0.3 );
        } else if(model == 2) {
            //VASE 1 -fixed
            mesh.position.set( 0, 0.45, 0 );
        // mesh.rotation.set( 0, - Math.PI / 2, 0 );
            mesh.rotation.x = -Math.PI / -2;
            mesh.scale.set( 0.2, 0.2, 0.2 );
        } else {
            //VASE 3 & 5
            mesh.position.set( 0, -0.495, 0 );
            mesh.scale.set( 0.01, 0.01, 0.01 );
            mesh.rotation.x = -Math.PI / 2;
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add( mesh );

    }, (xhr) => {
        const progressXHR = Math.round(xhr.loaded / xhr.total * 100) + " %";
        //console.log(progressXHR)
        progressTxt.innerHTML = progressXHR;
    });
}

if(modelParam === null || modelParam === "")
    loadEmUp(1);
else
    loadEmUp(modelParam)

// Lights

scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );

addShadowedLight( 1, 1, 1, 0xffffff, 3.5 );
addShadowedLight( 0.5, 1, - 1, 0xffd500, 3 );
// renderer

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

container.appendChild( renderer.domElement );

// stats
stats = new Stats();
//container.appendChild( stats.dom );

// Orbit
const controls = new  OrbitControls( camera, renderer.domElement );

window.addEventListener( 'resize', onWindowResize );


function addShadowedLight( x, y, z, color, intensity ) {

    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = - 0.002;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    groundMirror.getRenderTarget().setSize(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
    );

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    render();
    stats.update();

}

function render() {

    const timer = Date.now() * 0.0005;

//    mesh.rotation.z += timer * 0.5;
    if(cameraMove) {
        camera.position.x = Math.cos( timer ) * 3;
        camera.position.z = Math.sin( timer ) * 3;
    }
    camera.lookAt( cameraTarget );

    renderer.render( scene, camera );

}

window.makeCameraMove = function() {
    cameraMove = (!cameraMove) ? true : false;
}

function onTransitionEnd( event ) {
    event.target.remove();
}