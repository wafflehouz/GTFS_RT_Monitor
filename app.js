const axios = require('axios');
const fs = require('fs');
const AdmZip = require('adm-zip');
const csvtojson = require('csvtojson');

// URL of the file to download
const fileUrl = "https://www.phoenixopendata.com/dataset/3eae9a4a-98b9-40c8-8df7-8c00c1756235/resource/28ccc0a5-49c8-495c-b91f-193de5ce2cb7/download/valley-metro-bus-schedule_valley-metro-bus-schedule_googletransit.zip";

// Path to save the downloaded file
const outputFilePath = "./valley-metro-bus-schedule.zip";

// Path to extract the zip file
const extractPath = "./extracted";

axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream'
}).then(response => {
    const writer = fs.createWriteStream(outputFilePath);
    response.data.pipe(writer);
    writer.on('finish', () => {
        console.log('File downloaded successfully.');

        // Extract the zip file
        const zip = new AdmZip(outputFilePath);
        zip.extractAllTo(extractPath, /*overwrite*/true);
        console.log('File extracted successfully.');

        // Convert the trips.txt file to JSON
        const csvFilePath = `${ extractPath }/trips.txt`;
        const jsonFilePath = `${ extractPath }/trips.json`;

        csvtojson()
            .fromFile(csvFilePath)
            .then((jsonObj) => {
                fs.writeFileSync(jsonFilePath, JSON.stringify(jsonObj, null, 2));
                console.log('CSV file has been converted to JSON.');
            });

    });
    writer.on('error', (error) => {
        console.error('Error occurred while downloading file.', error);
    });
}).catch(error => {
    console.error('Error occurred while making the request.', error);
});

// RT Data Feed here