space := $(empty) $(empty)
#project directory from makefile
path := $(subst ?, ,$(dir $(subst $(space),?,$(abspath $(lastword $(MAKEFILE_LIST))))))

#paths of chrome browser and disable-web-security-mod-sandbox
chrome := C:/Program Files (x86)/Google/Chrome/Application/Chrome.exe
sandbox := $(path)test/chrome_sandbox

#common sources & library directory
src := $(path)src/
lib := $(path)lib/

#browserify entry files
entry := $(src)js/main.js
debugEntry := $(src)js/debug.js
#browserify target file
#library := $(lib)client.js

#html source path
clientSource := $(src)html/client.html
#html target path
clientTarget := $(path)client.html


.SILENT:
build:
#build: $(subst $(space),\ ,$(clientTarget))
	echo BUNDLE JS SOURCES
#	mkdir -p "$(dir $(library))"
#	browserify "$(entry)" > "$(library)"
	browserify "$(entry)" | uglifyjs | sed 's/&/\\\\\\\\&/g' | sed 's/"/\\"/g' |\
	xargs -I "{}" sed 's@</body>@<script>{}</script></body>@' "$(clientSource)" > "$(clientTarget)"

debugBuild:
#debugBuild: $(subst $(space),\ ,$(clientTarget))
	echo BUNDLE JS SOURCES for TEST
#	mkdir -p "$(dir $(library))"
#	browserify "$(debugEntry)" > "$(library)"
	browserify "$(debugEntry)" | uglifyjs | sed 's/&/\\\\\\\\&/g' | sed 's/"/\\"/g' |\
	xargs -I "{}" sed 's@</body>@<script>{}</script></body>@' "$(clientSource)" > "$(clientTarget)"

#$(subst $(space),\ ,$(clientTarget)): $(subst $(space),\ ,$(clientSource))
#	echo COPY CLIENT HTML
#	cp "$(clientSource)" "$(clientTarget)"

	
run: build
	"$(chrome)" "$(clientTarget)" --incognito --disable-web-security --user-data-dir="$(sandbox)" &
	
debug: debugBuild
	"$(chrome)" "$(clientTarget)" --incognito --disable-web-security --user-data-dir="$(sandbox)" &
	
clean:
	echo REMOVE BIULD RESULTS
	if [ -f "$(clientTarget)" ]; then rm "$(clientTarget)"; fi
	
	if [ -d "$(sandbox)" ]; then echo REMOVE FILES FOR TEST && rm -r "$(sandbox)"; fi
	
	echo REMOVE EMPTY DIRECTORIES
	find $(path) -type d -empty -delete