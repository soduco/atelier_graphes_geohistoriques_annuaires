### silk commands for MacOS
It works weel in cd /Applications.

#### silk workbench

```
cd /Applications/silk/silk-workbench/bin
export JAVA_HOME='/Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home'
./silk-workbench
```

#### silk single machine

```
cd /Applications/silk/silk-single-machine/
export JAVA_HOME='/Library/Java/JavaVirtualMachines/temurin-8.jdk/Contents/Home'
java -DconfigFile=monFichierDeConfig.xml -jar silk.jar
```

In monFichierDeConfig.xml, file directory must be explicit in output file parameters, as:
```xml
</Output>

	<Output type="file">
	<Param name="file" value="/Users/admin/myDirectory/output_links.nt"/>
		<Param name="format" value="ntriples"/>
</Output>
```