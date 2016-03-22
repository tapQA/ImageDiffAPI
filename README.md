# ImageDiffAPI

Centralize screenshot uploads from a remote WebDriver run to check the rendering differences of complex SVG applications.

## Requires

* [PerceptualDiff](http://pdiff.sourceforge.net/) symlinked to `/bin/perceptualdiff`
* [Node >=4](https://nodejs.org/)

## Use
A remote webdriver will start an application to test, load the page needing validation, and snap a screenshot. As an exit task, WebDriver will need to POST the screen shot to the API.

```bash
$ curl -F "screenshot=@/path/of/image" http://api.domain/api/images
```

After all of the capabilities have been run another request is made to validate the images.

```bash	
$ curl http://api.domain/api/start_diffing
```

This command will return a collection of images that have not passed the image diffing process

```json
{
	"failedTests": [
		"image1.png",
		"image2.png",
		"image15.png"
	]
}
```

## Gotchas
* A control image needs to be uploaded at some point prior to the diffing process. This is currently a manual process because it requires a human to validate that the control image is as expected. A control image can be uploaded with a separate POST request.

	```bash
	$ curl -F "screenshot=@/path/of/image" http:/api.domain/api/control
	```
