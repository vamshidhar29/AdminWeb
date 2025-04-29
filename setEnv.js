const axios = require('axios');

const AWS = require("aws-sdk");
require("dotenv").config();

const amplify = new AWS.Amplify({
  region: process.env.REACT_APP_AWS_REGION,
});

const amplifyAppId = process.env.REACT_APP_APPID;
const branchName = process.env.REACT_APP_BRANCH;

const fetchData = async (urlPath, axiosBody) => {
    try {
        const config = {
            method: "POST",
            url: process.env.REACT_APP_BASEURL + urlPath,
            Headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            data: axiosBody
        }
        const response = await axios(config);
       
        return response.data;

    } catch (error) {
        console.error('Error while fetching data ', error);
        return;
    }
}

async function updateEnv() {
  try {
    console.log(`Fetching config for branch: ${branchName}...`, amplifyAppId, branchName);

    const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });

    const configValues = response.reduce((acc, { ConfigKey, ConfigValue }) => {
        acc[`REACT_APP_${ConfigKey}`] = ConfigValue;
        return acc;
      }, {});

    // console.log("configValues: ", configValues);

    console.log(`Updating environment variables for branch: ${branchName}`);

    await amplify.updateBranch({
      appId: amplifyAppId,
      branchName: branchName,
      environmentVariables: configValues,
    }).promise();

    console.log(`Environment variables updated successfully for branch: ${branchName}`);
  } catch (error) {
    console.error(`Error updating env for ${branchName}:`, error);
  }
}

updateEnv();
