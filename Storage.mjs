/* https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem */
export default class Storage extends ENV {
    constructor() {
        super();
    }

    getItem(keyName = new String) {
        let keyValue = null;
        // 如果以 @
        if (keyName.startsWith('@')) {
            const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(keyName)
            const objval = objkey ? this.getItem(objkey) : ""
            if (objval) {
                try {
                    const objedval = JSON.parse(objval)
                    keyValue = objedval ? this.lodash.get(objedval, paths, "") : keyValue;
                } catch (e) {
                    keyValue = ""
                }
            };
        };
        switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
				keyValue = $persistentStore.read(keyName);
			case 'Quantumult X':
				keyValue = $prefs.valueForKey(keyName);
			case 'Node.js':
				this.data = this.loaddata();
				keyValue = this.data[keyName];
			default:
				keyValue = this.data?.[keyName] || null;
		};
        return keyValue;
    };

    setItem(keyName = new String, keyValue = new String) {
        if (keyName.startsWith('@')) {
            const [, objkey, paths] = /^@(.*?)\.(.*?)$/.exec(keyName);
            const objdat = this.getItem(objkey);
            const objval = objkey ? objdat === 'null' ? null : objdat || '{}' : '{}';
            try {
                const objedval = JSON.parse(objval)
                this.lodash.set(objedval, paths, keyValue);
                keyName = objkey;
                keyValue = JSON.stringify(objedval);
            } catch (e) {
                const objedval = {}
                this.lodash.set(objedval, paths, keyValue)
                keyName = objkey;
                keyValue = JSON.stringify(objedval);
            }
        }
        switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
				return $persistentStore.write(keyValue, keyName)
			case 'Quantumult X':
				return $prefs.setValueForKey(keyValue, keyName)
			case 'Node.js':
				this.data = this.loaddata()
				this.data[keyName] = keyValue
				this.writedata()
				return true
			default:
				return this.data?.[keyName] || null
		}
    };

    removeItem(keyName){
    }

    clear() {
    }

	loaddata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs')
			this.path = this.path ? this.path : require('path')
			const curDirDataFilePath = this.path.resolve(this.dataFile)
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
			)
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
			if (isCurDirDataFile || isRootDirDataFile) {
				const datPath = isCurDirDataFile
					? curDirDataFilePath
					: rootDirDataFilePath
				try {
					return JSON.parse(this.fs.readFileSync(datPath))
				} catch (e) {
					return {}
				}
			} else return {}
		} else return {}
	}

	writedata() {
		if (this.isNode()) {
			this.fs = this.fs ? this.fs : require('fs')
			this.path = this.path ? this.path : require('path')
			const curDirDataFilePath = this.path.resolve(this.dataFile)
			const rootDirDataFilePath = this.path.resolve(
				process.cwd(),
				this.dataFile
			)
			const isCurDirDataFile = this.fs.existsSync(curDirDataFilePath)
			const isRootDirDataFile =
				!isCurDirDataFile && this.fs.existsSync(rootDirDataFilePath)
			const jsondata = JSON.stringify(this.data)
			if (isCurDirDataFile) {
				this.fs.writeFileSync(curDirDataFilePath, jsondata)
			} else if (isRootDirDataFile) {
				this.fs.writeFileSync(rootDirDataFilePath, jsondata)
			} else {
				this.fs.writeFileSync(curDirDataFilePath, jsondata)
			}
		}
	};

}
