import Lodash from './Lodash.mjs'

/* https://developer.mozilla.org/zh-CN/docs/Web/API/Storage/setItem */
export default class Storage {
	#nameRegex = /^@(?<keyName>[^.]+)(?:\.(?<path>.*))?$/;
	#lodash = new Lodash()
	#name = "Storage"
	#version = '1.0.0'

	constructor(opts) {
		this.data = null
		this.dataFile = 'box.dat'
		Object.assign(this, opts)
		console.log(`\n🟧 ${this.#name} v${this.#version}\n`)
	}

    getItem(keyName = new String) {
        let keyValue = null;
        // 如果以 @
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				keyName = key;
				let value = this.getItem(keyName);
				try {
					value = JSON.parse(value ?? "{}");
				} catch (e) {
					value = {};
				};
				keyValue = this.#lodash.get(value, path);
				break;
			default:
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
						this.data = this.#loaddata();
						keyValue = this.data[keyName];
					default:
						keyValue = this.data?.[keyName] || null;
				};
				try {
					keyValue = JSON.parse(keyValue);
				} catch (e) {
					// do nothing
				};
				break;
		};
		return keyValue;
    };

	setItem(keyName = new String, keyValue = new String) {
		let result = false;
		switch (typeof keyValue) {
			case "object":
				keyValue = JSON.stringify(keyValue);
				break;
			default:
				keyValue = String(keyValue);
				break;
		};
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				keyName = key;
				let value = this.getItem(keyName);
				try {
					value = JSON.parse(value ?? "{}");
				} catch (e) {
					value = {};
				};
				this.#lodash.set(value, path, keyValue);
				result = this.setItem(keyName, value);
				break;
			default:
				switch (this.platform()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = $persistentStore.write(keyValue, keyName)
					case 'Quantumult X':
						result =$prefs.setValueForKey(keyValue, keyName)
					case 'Node.js':
						this.data = this.#loaddata()
						this.data[keyName] = keyValue
						this.#writedata()
						result = true
					default:
						result = this.data?.[keyName] || null
				};
				break;
		};
		return result;
	};

    removeItem(keyName){
		let result = false;
		switch (keyName.startsWith('@')) {
			case true:
				const { key, path } = keyName.match(this.#nameRegex)?.groups;
				keyName = key;
				let value = this.getItem(keyName);
				try {
					value = JSON.parse(value ?? "{}");
				} catch (e) {
					value = {};
				};
				keyValue = this.#lodash.unset(value, path);
				result = this.setItem(keyName, value);
				break;
			default:
				switch (this.platform()) {
					case 'Surge':
					case 'Loon':
					case 'Stash':
					case 'Egern':
					case 'Shadowrocket':
						result = false;
						break;
					case 'Quantumult X':
						result = $prefs.removeValueForKey(keyName);
						break;
					case 'Node.js':
						result = false
						break;
					default:
						result = false;
						break;
				};
				break;
		};
		return result;
    }

    clear() {
		let result = false;
		switch (this.platform()) {
			case 'Surge':
			case 'Loon':
			case 'Stash':
			case 'Egern':
			case 'Shadowrocket':
				result = false;
				break;
			case 'Quantumult X':
				result = $prefs.removeAllValues();
				break;
			case 'Node.js':
				result = false
				break;
			default:
				result = false;
				break;
		};
		return result;
    }

	#loaddata() {
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

	#writedata() {
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
