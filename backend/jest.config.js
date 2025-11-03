export default {
    testEnvironment: "node",
    transform: {
        "^.+\\.js$": "babel-jest",
    },
    testMatch: ["**/tests/**/*.test.js"],
    moduleFileExtensions: ["js", "json", "node"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"]
}