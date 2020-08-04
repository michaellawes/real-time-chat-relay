module.exports = {
    preset: '@shelf/jest-mongodb',
    testEnvironment: 'node',
    testTimeout: 3000,
    "testMatch": [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
};