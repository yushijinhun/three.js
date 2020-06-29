import buble from 'rollup-plugin-buble';
import { minifyJavascript } from '@yushijinhun/three-minifier-common/js-minifier';
import MagicString from 'magic-string';

const threeMinifier = {
	transform: ( code, file ) => {

		const s = new MagicString( code );
		for ( const match of minifyJavascript( code, file ) ) {

			s.overwrite( match.start, match.end, match.replacement );

		}

		return {

			code: s.toString(),
			map: s.generateMap()

		};

	}
};

function bubleCleanup() {

	const danglingTabs = /(^\t+$\n)|(\n^\t+$)/gm;
	const wrappedClass = /(var (\w+) = \/\*@__PURE__*\*\/\(function \((\w+)\) {\n).*(return \2;\s+}\(\3\)\);\n)/s;
	const unwrap = function ( match, wrapperStart, klass, parentClass, wrapperEnd ) {

		return match
			.replace( wrapperStart, '' )
			.replace( `if ( ${parentClass} ) ${klass}.__proto__ = ${parentClass};`, '' )
			.replace(
				`${klass}.prototype = Object.create( ${parentClass} && ${parentClass}.prototype );`,
				`${klass}.prototype = Object.create( ${parentClass}.prototype );`
			)
			.replace( wrapperEnd, '' )
			.replace( danglingTabs, '' );

	};

	return {

		transform( code ) {

			while ( wrappedClass.test( code ) ) {

				code = code.replace( wrappedClass, unwrap );

			}

			return {
				code: code,
				map: null
			};

		}

	};

}

export default [
	{
		input: 'src/Three.js',
		plugins: [
			threeMinifier,
			buble( {
				transforms: {
					arrow: false,
					classes: true
				}
			} ),
			bubleCleanup()
		],
		output: [
			{
				format: 'umd',
				name: 'THREE',
				file: 'build/three.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/Three.js',
		plugins: [
			threeMinifier
		],
		output: [
			{
				format: 'esm',
				file: 'build/three.module.js',
				indent: '\t'
			}
		]
	}
];
