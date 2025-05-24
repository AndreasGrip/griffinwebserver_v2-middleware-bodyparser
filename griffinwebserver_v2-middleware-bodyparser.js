const textMimes = ['application/json', 'application/xml', 'application/x-www-form-urlencoded'];

function isJSON(string) {
  try {
    JSON.parse(string);
    return true;
  } catch (e) {
    return false;
  }
}

function parseFormData(string) {
  const formObj = {};
  const formArr = string.split('&');
  formArr.forEach((parameter) => {
    const [key, value] = parameter.split('=');
    // If any key don't have a value consider this to be a broken format. (plsease tell me if this is wrong)
    if (value === undefined) return new Error('Broken HTML form data, key without value');
    formObj[key] = value;
  });

  return formObj;
}

function middlewareBodyParser(req, res) {
  const bodyData = [];
  return new Promise((resolve, reject) => {
    // get all chungs of data and add them
    req.on('data', (chunk) => {
      bodyData.push(...chunk);
    });

    // once all chunks of data are recived
    req.on('end', () => {
      // Check if we got any data, otherwise just continue
      if (bodyData.length === 0) resolve();

      // Test if any (should just be one) content-type headers contains 'text/' or exists in the textMimes array.
      // if so, convert it to text.
      const contentType = req.headers['content-type'];
      if (contentType) {
        if (/text\//.test(contentType) || textMimes.includes(contentType)) {
          if(Buffer.isBuffer(bodyData)) {
            req.body = Buffer.from(bodyData).toString();
          } else {
            req.body = bodyData;
          }
        }

        // convert JSON into a object
        if (req.headers['content-type'] === 'application/json') {
          if (typeof req.body === 'string' && isJSON(req.body)) {
            req.body = JSON.parse(req.body);
            resolve();
          } else {
            res.statusCode = 400;
            res.end('Bad Request - Invalid JSON Body');
            reject();
          }
        }

        // convert form data into a object
        if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
          if (typeof req.body === 'string') {
            const formData = parseFormData(req.body);
            if (formData instanceof Error) {
              res.statusCode = 400;
              res.end('Bad Request - Invalid Form Data');
              reject();
            } else {
              req.body = formData;
              resolve();
            }
          } else {
            res.statusCode = 400;
            res.end('Bad Request - Invalid Form Data');
            reject();
          }
        }
      }
    });
  });
}

module.exports = middlewareBodyParser;
