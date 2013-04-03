APPNAME=Labcoat.app
NWURL=https://s3.amazonaws.com/node-webkit/v0.4.2/node-webkit-v0.4.2-osx-ia32.zip
NWZIP=node-webkit.zip

OLDPWD=$PWD

if [ ! -d $APPNAME ]; then
    curl -o $NWZIP $NWURL
    unzip $NWZIP
    rm nwsnapshot
    mv node-webkit.app $APPNAME
    rm $NWZIP
fi

cp $OLDPWD/bin/osx/Info.plist $OLDPWD/$APPNAME/Contents/

cd bin/debug/node-webkit
zip -r $OLDPWD/$APPNAME/Contents/Resources/app.nw *
