/*******************生成立方体纹理对象*******************************/
function configureCubeMap(program) {
	gl.activeTexture(gl.TEXTURE0);

    cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, "cubeSampler"), 0);

	var faces = [
	    ["./skybox/right.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
        ["./skybox/left.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
        ["./skybox/top.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
        ["./skybox/bottom.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
        ["./skybox/front.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
        ["./skybox/back.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
		];
    
    for (var i = 0; i < 6; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.src = faces[i][0];
        image.onload = function (cubeMap, face, image) {
            return function () {
		        gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            }
        }(cubeMap, face, image);
    }
}

/*TODO1:创建一般2D颜色纹理对象并加载图片*/
function configureTexture(image) {
    var texture = gl.createTexture();
    
    // 绑定当前纹理
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // 上传图像数据到GPU
    // 参数: 目标, 级别, 内部格式, 格式, 数据类型, 图像源
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // 生成Mipmap (多级渐远纹理)，这对缩小时的抗锯齿很重要
    gl.generateMipmap(gl.TEXTURE_2D);
    
    // 设置纹理参数
    // 缩小过滤器使用 Mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    // 放大过滤器使用线性插值
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    return texture;
}