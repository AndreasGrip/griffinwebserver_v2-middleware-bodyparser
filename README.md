This is a session middleware for griffinwebserver_v2.

It takes the data from requests and put in into req.body, by default as a Buffer but some content-types are treated different.

'application/x-www-form-urlencoded'
This is when you have a form that uses method post
the data will be converted to a object
Example, postdata firstName=john&lastName=doe
req.body = {firstName: "john", lastName: "doe"}

'application/json'
This will just be converted to a object.

'text/\*'
Will be converted to text
req.body = "Lorem ipsum dolor sit amet, consectetur adipiscing elit"

More formats will be converted to text in the future, please make sure it's a buffer before manually convert it to a string.

const newString = Buffer.isBuffer(bodyData) ? Buffer.from(bodyData).toString() : bodyData;


Buffers are binary data, and to handle for instance upload of files you need to read up on Buffers
