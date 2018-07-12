/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author Daosheng Mu / https://github.com/DaoshengMu/
 */

/**************************************************************
 *	ImageUtils image对象的工具集,更方便的加载图片的辅助类.
 **************************************************************/
THREE.ImageUtils = {

	crossOrigin: undefined,	 	//跨域加载图片.
	/*
	///loadTexture加载url指定的位置的图片资源,并创建纹理,返回纹理对象.
	*/
	///<summary>loadTexture</summary>
	///<param name ="url" type="URLString">图像资源定位符</param>
	///<param name ="mapping" type="Number">映射模式,可用常量参考下面注释</param>
	///<param name ="onLoad" type="CallbackFunction">回调函数</param>
	///<param name ="onError" type="CallbackFunction">回调函数</param>
	///<returns type="THREE.Texture">返回创建的纹理对象.</returns>
	loadTexture: function ( url, mapping, onLoad, onError ) {
		//创建图片加载器.
		var loader = new THREE.ImageLoader();
		loader.crossOrigin = this.crossOrigin;

		var texture = new THREE.Texture( undefined, mapping );	//创建纹理对象
		//从图像资源定位符加载指定的图片.
		loader.load( url, function ( image ) {

			texture.image = image;
			texture.needsUpdate = true;	//当设置为true时,标记文理已经更新

			if ( onLoad ) onLoad( texture );	//如果有回调函数,执行回调函数

		}, undefined, function ( event ) {

			if ( onError ) onError( event );

		} );

		texture.sourceFile = url; 	//源文件位置.

		return texture;	//返回创建的纹理对象

	},
	/*
	///loadTextureCube加载url数组中指定的位置的图片资源,并创建纹理,返回立方体纹理对象.
	*/
	///<summary>loadTextureCube</summary>
	///<param name ="array" type="URLStringArray">图像资源定位符数组</param>
	///<param name ="mapping" type="Number">映射模式,可用常量参考下面注释</param>
	///<param name ="onLoad" type="CallbackFunction">回调函数</param>
	///<param name ="onError" type="CallbackFunction">回调函数</param>
	///<returns type="THREE.Texture">返回立方体纹理对象.</returns>
	loadTextureCube: function ( array, mapping, onLoad, onError ) {

		var images = [];

		var loader = new THREE.ImageLoader();
		loader.crossOrigin = this.crossOrigin;

		var texture = new THREE.CubeTexture( images, mapping );	//创建立方体纹理对象

		// no flipping needed for cube textures

		texture.flipY = false;

		var loaded = 0;

		var loadTexture = function ( i ) {

			loader.load( array[ i ], function ( image ) {

				texture.images[ i ] = image;

				loaded += 1;

				if ( loaded === 6 ) {

					texture.needsUpdate = true;

					if ( onLoad ) onLoad( texture );

				}

			} );

		}

		for ( var i = 0, il = array.length; i < il; ++ i ) {	//遍历数组中的图片资源

			loadTexture( i );	//一一加载并创建纹理对象.

		}

		return texture;	//返回立方体纹理对象

	},
	/*
	///loadCompressedTexture加载压缩纹理对象,该方法已经被删除,这里保留为了向后兼容,使用THREE.DDSLoader替换.
	*/
	///<summary>loadCompressedTexture</summary>
	loadCompressedTexture: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.' )

	},
	/*
	///loadCompressedTextureCube加载压缩的立方体纹理对象,该方法已经被删除,这里保留为了向后兼容,使用THREE.DDSLoader替换.
	*/
	///<summary>loadCompressedTextureCube</summary>
	loadCompressedTextureCube: function () {

		console.error( 'THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.' )

	},
	/*
	///getNormalMap通过参数image(图像对象),参数(深度信息),获得法线贴图.
	///法线贴图（Normal mapping）在三维计算机图形学中，是凸凹贴图（Bump mapping）技术的一种应用，法线贴图有时也称为“Dot3（仿立體）
	///凸凹纹理贴图”。凸凹与纹理贴图通常是在现有的模型法线添加扰动不同，法线贴图要完全更新法线。与凸凹贴图类似的是，它也是用来在
	///不增加多边形的情况下在浓淡效果中添加细节。但是凸凹贴图通常根据一个单独的灰度图像通道进行计算，而法线贴图的数据源图像通常是
	///从更加细致版本的物体得到的多通道图像，即红、绿、蓝通道都是作为一个单独的颜色对待。
	*/
	///<summary>getNormalMap</summary>
	///<param name ="image" type="Image">图像对象</param>
	///<param name ="depth" type="float">深度信息0.0-1.0</param>
	///<returns type="THREE.Texture">返回法线贴图.</returns>
	getNormalMap: function ( image, depth ) {

		// Adapted from http://www.paulbrunt.co.uk/lab/heightnormal/

		var cross = function ( a, b ) {

			return [ a[ 1 ] * b[ 2 ] - a[ 2 ] * b[ 1 ], a[ 2 ] * b[ 0 ] - a[ 0 ] * b[ 2 ], a[ 0 ] * b[ 1 ] - a[ 1 ] * b[ 0 ] ];

		}

		var subtract = function ( a, b ) {

			return [ a[ 0 ] - b[ 0 ], a[ 1 ] - b[ 1 ], a[ 2 ] - b[ 2 ] ];

		}
		/*
		///normalize方法将返回向量的长度为1（只读）.
		/// 复习一下初中的几何吧,三角恒等式,给你准备好了 :) ,见维基百科:
		/// http://zh.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%87%BD%E6%95%B0#.E4.B8.89.E8.A7.92.E6.81.92.E7.AD.89.E5.BC.8F
		*/
		///<summary>normalize</summary>
		///<returns type="number">返回向量的长度为1（只读）</returns>
		var normalize = function ( a ) {

			var l = Math.sqrt( a[ 0 ] * a[ 0 ] + a[ 1 ] * a[ 1 ] + a[ 2 ] * a[ 2 ] );
			return [ a[ 0 ] / l, a[ 1 ] / l, a[ 2 ] / l ];

		}

		depth = depth | 1;

		var width = image.width;
		var height = image.height;

		var canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0 );

		var data = context.getImageData( 0, 0, width, height ).data;
		var imageData = context.createImageData( width, height );
		var output = imageData.data;

		for ( var x = 0; x < width; x ++ ) {

			for ( var y = 0; y < height; y ++ ) {

				var ly = y - 1 < 0 ? 0 : y - 1;
				var uy = y + 1 > height - 1 ? height - 1 : y + 1;
				var lx = x - 1 < 0 ? 0 : x - 1;
				var ux = x + 1 > width - 1 ? width - 1 : x + 1;

				var points = [];
				var origin = [ 0, 0, data[ ( y * width + x ) * 4 ] / 255 * depth ];
				points.push( [ - 1, 0, data[ ( y * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, - 1, data[ ( ly * width + lx ) * 4 ] / 255 * depth ] );
				points.push( [ 0, - 1, data[ ( ly * width + x ) * 4 ] / 255 * depth ] );
				points.push( [  1, - 1, data[ ( ly * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 0, data[ ( y * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 1, 1, data[ ( uy * width + ux ) * 4 ] / 255 * depth ] );
				points.push( [ 0, 1, data[ ( uy * width + x ) * 4 ] / 255 * depth ] );
				points.push( [ - 1, 1, data[ ( uy * width + lx ) * 4 ] / 255 * depth ] );

				var normals = [];
				var num_points = points.length;

				for ( var i = 0; i < num_points; i ++ ) {

					var v1 = points[ i ];
					var v2 = points[ ( i + 1 ) % num_points ];
					v1 = subtract( v1, origin );
					v2 = subtract( v2, origin );
					normals.push( normalize( cross( v1, v2 ) ) );

				}

				var normal = [ 0, 0, 0 ];

				for ( var i = 0; i < normals.length; i ++ ) {

					normal[ 0 ] += normals[ i ][ 0 ];
					normal[ 1 ] += normals[ i ][ 1 ];
					normal[ 2 ] += normals[ i ][ 2 ];

				}

				normal[ 0 ] /= normals.length;
				normal[ 1 ] /= normals.length;
				normal[ 2 ] /= normals.length;

				var idx = ( y * width + x ) * 4;

				output[ idx ] = ( ( normal[ 0 ] + 1.0 ) / 2.0 * 255 ) | 0;
				output[ idx + 1 ] = ( ( normal[ 1 ] + 1.0 ) / 2.0 * 255 ) | 0;
				output[ idx + 2 ] = ( normal[ 2 ] * 255 ) | 0;
				output[ idx + 3 ] = 255;

			}

		}

		context.putImageData( imageData, 0, 0 );

		return canvas;	//返回法线贴图.

	},
	/*
	///generateDataTexture类生成DataTexture对象使用的图像数据.
	*/
	///<summary>DataTexture</summary>
	///<param name ="width" type="Number">图像宽度</param>
	///<param name ="height" type="Number">图像高度</param>
	///<param name ="color" type="Color">颜色</param>
	generateDataTexture: function ( width, height, color ) {

		var size = width * height;
		var data = new Uint8Array( 3 * size );	//创建8位无符号整数数组,数组长度是高乘宽的3倍.

		var r = Math.floor( color.r * 255 );	//
		var g = Math.floor( color.g * 255 );
		var b = Math.floor( color.b * 255 );

		for ( var i = 0; i < size; i ++ ) {

			data[ i * 3 ] 	  = r;
			data[ i * 3 + 1 ] = g;
			data[ i * 3 + 2 ] = b;

		}

		var texture = new THREE.DataTexture( data, width, height, THREE.RGBFormat );	//创建基于图像数据的反射或者折射纹理贴图.
		texture.needsUpdate = true;	//标记纹理需要更新.

		return texture;	//返回纹理对象.

	}

};
