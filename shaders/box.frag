#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength,shininess;

in vec3 Normal;//法向量
in vec3 FragPos;//相机观察的片元位置
in vec2 TexCoord;//纹理坐标
in vec4 FragPosLightSpace;//光源观察的片元位置

uniform vec3 viewPos;//相机位置
uniform vec4 u_lightPosition; //光源位置	
uniform vec3 lightColor;//入射光颜色

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform samplerCube cubeSampler;//盒子纹理采样器


float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir)
{
    float shadow=0.0;  //非阴影
    /*TODO3: 添加阴影计算，返回1表示是阴影，返回0表示非阴影*/
    
     // 1. 执行透视除法
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    
    // 2. 将坐标从 [-1, 1] 变换到 [0, 1]
    projCoords = projCoords * 0.5 + 0.5;
    
    // 3. 取得最近的深度值 (使用[0,1]范围下的 .r分量)
    float closestDepth = texture(depthTexture, projCoords.xy).r; 
    
    // 4. 取得当前片元在光源视角下的深度
    float currentDepth = projCoords.z;
    
    // 5. 计算偏置(Bias)以解决阴影痤疮 (Shadow Acne)
    // 根据表面法线和光照方向动态调整
    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);
    
    // 6. 比较当前深度和最近深度 (currentDepth > closestDepth 表示在阴影中)
    // 使用 bias 防止自阴影
    shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    
    // 7. 解决超出视锥体远平面的采样问题 (强制为非阴影)
    if(projCoords.z > 1.0)
        shadow = 0.0;
    
    return shadow;
   
}       

void main()
{
    
    //采样纹理颜色
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

    //计算光照颜色
 	vec3 norm = normalize(Normal);
	vec3 lightDir;
	if(u_lightPosition.w==1.0) 
        lightDir = normalize(u_lightPosition.xyz - FragPos);
	else lightDir = normalize(u_lightPosition.xyz);
	vec3 viewDir = normalize(viewPos - FragPos);
	vec3 halfDir = normalize(viewDir + lightDir);


    /*TODO2:根据phong shading方法计算ambient,diffuse,specular*/
    vec3  ambient,diffuse,specular;
    // 1. 环境光 (Ambient)
    ambient = ambientStrength * lightColor;
    
    // 2. 漫反射 (Diffuse)
    // 计算法向量与光线方向的点积，取非负值
    float diff = max(dot(norm, lightDir), 0.0);
    diffuse = diff * diffuseStrength * lightColor;
    
    // 3. 镜面光 (Specular) - 这里利用上下文已有的 halfDir 使用 Blinn-Phong 模型
    // 如果必须严格用Phong，需计算 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
    specular = spec * specularStrength * lightColor;
  
  	vec3 lightReflectColor=(ambient +diffuse + specular);
  	
    //判定是否阴影，并对各种颜色进行混合
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
	
    //vec3 resultColor =(ambient + (1.0-shadow) * (diffuse + specular))* TextureColor;
    vec3 resultColor=(1.0-shadow/2.0)* lightReflectColor * TextureColor;
    
    FragColor = vec4(resultColor, 1.f);
}


