const Matrix4x4 = {
    eye: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    plus: function (mat1, mat2) {
        const result = mat1.concat();
        for (let i = 0; i < 16; i++) {
            result[i] += mat2[i];
        }
        return result;
    },
    add: function (mat1, mat2) {
        for (let i = 0; i < 16; i++) {
            mat1[i] += mat2[i];
        }
    },
    minus: function (mat1, mat2) {
        const result = mat1.concat();
        for (let i = 0; i < 16; i++) {
            result[i] -= mat2[i];
        }
        return result;
    },
    sub: function (mat1, mat2) {
        for (let i = 0; i < 16; i++) {
            mat1[i] -= mat2[i];
        }
    },
    times: function (mat1, mat2) {
        return [
            mat1[0] * mat2[0] + mat1[4] * mat2[1] + mat1[8] * mat2[2] + mat1[12] * mat2[3],
            mat1[1] * mat2[0] + mat1[5] * mat2[1] + mat1[9] * mat2[2] + mat1[13] * mat2[3],
            mat1[2] * mat2[0] + mat1[6] * mat2[1] + mat1[10] * mat2[2] + mat1[14] * mat2[3],
            mat1[3] * mat2[0] + mat1[7] * mat2[1] + mat1[11] * mat2[2] + mat1[15] * mat2[3],
            mat1[0] * mat2[4] + mat1[4] * mat2[5] + mat1[8] * mat2[6] + mat1[12] * mat2[7],
            mat1[1] * mat2[4] + mat1[5] * mat2[5] + mat1[9] * mat2[6] + mat1[13] * mat2[7],
            mat1[2] * mat2[4] + mat1[6] * mat2[5] + mat1[10] * mat2[6] + mat1[14] * mat2[7],
            mat1[3] * mat2[4] + mat1[7] * mat2[5] + mat1[11] * mat2[6] + mat1[15] * mat2[7],
            mat1[0] * mat2[8] + mat1[4] * mat2[9] + mat1[8] * mat2[10] + mat1[12] * mat2[11],
            mat1[1] * mat2[8] + mat1[5] * mat2[9] + mat1[9] * mat2[10] + mat1[13] * mat2[11],
            mat1[2] * mat2[8] + mat1[6] * mat2[9] + mat1[10] * mat2[10] + mat1[14] * mat2[11],
            mat1[3] * mat2[8] + mat1[7] * mat2[9] + mat1[11] * mat2[10] + mat1[15] * mat2[11],
            mat1[0] * mat2[12] + mat1[4] * mat2[13] + mat1[8] * mat2[14] + mat1[12] * mat2[15],
            mat1[1] * mat2[12] + mat1[5] * mat2[13] + mat1[9] * mat2[14] + mat1[13] * mat2[15],
            mat1[2] * mat2[12] + mat1[6] * mat2[13] + mat1[10] * mat2[14] + mat1[14] * mat2[15],
            mat1[3] * mat2[12] + mat1[7] * mat2[13] + mat1[11] * mat2[14] + mat1[15] * mat2[15]
        ];
    },
    mul: function (mat1, mat2) {
        const buf = [
            mat1[0] * mat2[0] + mat1[4] * mat2[1] + mat1[8] * mat2[2] + mat1[12] * mat2[3],
            mat1[1] * mat2[0] + mat1[5] * mat2[1] + mat1[9] * mat2[2] + mat1[13] * mat2[3],
            mat1[2] * mat2[0] + mat1[6] * mat2[1] + mat1[10] * mat2[2] + mat1[14] * mat2[3],
            mat1[3] * mat2[0] + mat1[7] * mat2[1] + mat1[11] * mat2[2] + mat1[15] * mat2[3],
            mat1[0] * mat2[4] + mat1[4] * mat2[5] + mat1[8] * mat2[6] + mat1[12] * mat2[7],
            mat1[1] * mat2[4] + mat1[5] * mat2[5] + mat1[9] * mat2[6] + mat1[13] * mat2[7],
            mat1[2] * mat2[4] + mat1[6] * mat2[5] + mat1[10] * mat2[6] + mat1[14] * mat2[7],
            mat1[3] * mat2[4] + mat1[7] * mat2[5] + mat1[11] * mat2[6] + mat1[15] * mat2[7],
            mat1[0] * mat2[8] + mat1[4] * mat2[9] + mat1[8] * mat2[10] + mat1[12] * mat2[11],
            mat1[1] * mat2[8] + mat1[5] * mat2[9] + mat1[9] * mat2[10] + mat1[13] * mat2[11],
            mat1[2] * mat2[8] + mat1[6] * mat2[9] + mat1[10] * mat2[10] + mat1[14] * mat2[11],
            mat1[3] * mat2[8] + mat1[7] * mat2[9] + mat1[11] * mat2[10] + mat1[15] * mat2[11],
            mat1[0] * mat2[12] + mat1[4] * mat2[13] + mat1[8] * mat2[14] + mat1[12] * mat2[15],
            mat1[1] * mat2[12] + mat1[5] * mat2[13] + mat1[9] * mat2[14] + mat1[13] * mat2[15],
            mat1[2] * mat2[12] + mat1[6] * mat2[13] + mat1[10] * mat2[14] + mat1[14] * mat2[15],
            mat1[3] * mat2[12] + mat1[7] * mat2[13] + mat1[11] * mat2[14] + mat1[15] * mat2[15]
        ];
        for (let i = 0; i < 16; i++) {
            mat1[i] = buf[i];
        }
    },
    timesVec: function (mat, vec) {
        return [
            mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12] * vec[3],
            mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13] * vec[3],
            mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14] * vec[3],
            mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * vec[3]
        ];
    },
    applyVec: function (mat, vec) {
        const buf = [
            mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12] * vec[3],
            mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13] * vec[3],
            mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14] * vec[3],
            mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15] * vec[3]
        ];
        vec[0] = buf[0];
        vec[1] = buf[1];
        vec[2] = buf[2];
        vec[3] = buf[3];
    },
    rotationX: function (deg) {
        rad = deg * Math.PI / 180;
        return [
            1, 0, 0, 0,
            0, Math.cos(rad), Math.sin(rad), 0,
            0, -Math.sin(rad), Math.cos(rad), 0,
            0, 0, 0, 1
        ];
    },
    rotationY: function (deg) {
        rad = deg * Math.PI / 180;
        return [
            Math.cos(rad), 0, -Math.sin(rad), 0,
            0, 1, 0, 0,
            Math.sin(rad), 0, Math.cos(rad), 0,
            0, 0, 0, 1
        ];
    },
    rotationZ: function (deg) {
        rad = deg * Math.PI / 180;
        return [
            Math.cos(rad), Math.sin(rad), 0, 0,
            -Math.sin(rad), Math.cos(rad), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    translation: function (x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    },
    scale: function (x, y, z) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
    },
    createVMatrix: function(center = [0, 0, 0], alphDeg = 0, betaDeg = 0, length = 1) {
        const alph = alphDeg * Math.PI / 180;
        const beta = betaDeg * Math.PI / 180;
        const cameraX = center[0] + length * Math.cos(beta) * Math.sin(alph);
        const cameraY = center[1] + length * Math.sin(beta);
        const cameraZ = center[2] + length * Math.cos(beta) * Math.cos(alph);
        const result = this.rotationX(betaDeg);
        this.mul(result, this.rotationY(-alphDeg));
        this.mul(result, this.translation(-cameraX, -cameraY, -cameraZ));
        return result;
    },
    createPMatrix: function (fovy = 90, aspect = 1, near = 0.1, far = 100) {
        const t = near * Math.tan(fovy * Math.PI / 360);
        const r = t * aspect;
        const a = r * 2;
        const b = t * 2;
        const c = far - near;
        return [
            near*2/a,0,0,0,
            0,near*2/b,0,0,
            0,0,-(far+near)/c,-1,
            0,0,-(far*near*2)/c,0];
    }
}