uniform float iTime;
uniform vec2 iResolution;

#define pi 3.14159265
#define NUM 20.
#define PALETTE vec3(.0, 1.4, 2.)+1.5

// You can enable or disable these defines according to your needs
#define COLORED
#define MIRROR
//#define ROTATE
#define ROT_OFST
#define TRIANGLE_NOISE
//#define SHOW_TRIANGLE_NOISE_ONLY

mat2 mm2(in float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

float tri(in float x) {
    return abs(fract(x) - .5);
}

vec2 tri2(in vec2 p) {
    return vec2(tri(p.x + tri(p.y * 2.)), tri(p.y + tri(p.x * 2.)));
}

mat2 m2 = mat2(0.970, 0.242, -0.242, 0.970);

float triangleNoise(in vec2 p) {
    float z = 1.5;
    float z2 = 1.5;
    float rz = 0.;
    vec2 bp = p;
    for (float i = 0.; i <= 3.; i++) {
        vec2 dg = tri2(bp * 2.) * .8;
        dg *= mm2(iTime * .3);
        p += dg / z2;

        bp *= 1.6;
        z2 *= .6;
        z *= 1.8;
        p *= 1.2;
        p *= m2;

        rz += (tri(p.x + tri(p.y))) / z;
    }
    return rz;
}

void main() {
    float aspect = iResolution.x / iResolution.y;
    float w = 50. / sqrt(iResolution.x * aspect + iResolution.y);

    vec2 p = gl_FragCoord.xy / iResolution.xy * 2. - 1.;
    p.x *= aspect;
    p *= 1.05;
    vec2 bp = p;

    #ifdef ROTATE
    p *= mm2(iTime * .25);
    #endif

    float lp = length(p);
    float id = floor(lp * NUM + .5) / NUM;

    #ifdef ROT_OFST
    p *= mm2(id * 11.);
    #endif

    #ifdef MIRROR
    p.y = abs(p.y);
    #endif

    vec2 plr = vec2(lp, atan(p.y, p.x));

    float rz = 1. - pow(abs(sin(plr.x * pi * NUM)) * 1.25 / pow(w, 0.25), 2.5);

    float enp = plr.y + sin((iTime + id * 5.5)) * 1.52 - 1.5;
    rz *= smoothstep(0., 0.05, enp);

    rz *= smoothstep(0., .022 * w / plr.x, enp) * step(id, 1.);
    #ifndef MIRROR
    rz *= smoothstep(-0.01, .02 * w / plr.x, pi - plr.y);
    #endif

    #ifdef TRIANGLE_NOISE
    rz *= (triangleNoise(p / (w * w)) * 0.9 + 0.4);
    vec3 col = (sin(PALETTE + id * 5. + iTime) * 0.5 + 0.5) * rz;
    col += smoothstep(.4, 1., rz) * 0.15;
    col *= smoothstep(.2, 1., rz) + 1.;
    #else
    vec3 col = (sin(PALETTE + id * 5. + iTime) * 0.5 + 0.5) * rz;
    col *= smoothstep(.8, 1.15, rz) * .7 + .8;
    #endif

    #ifndef COLORED
    col = vec3(dot(col, vec3(.7)));
    #endif

    #ifdef SHOW_TRIANGLE_NOISE_ONLY
    col = vec3(triangleNoise(bp));
    #endif

    gl_FragColor = vec4(col, 1.0);
}
