var expect = require('chai').expect;
var commander = require('commander');
var parseCommandLineOptions = require('./../lib/parse-command-line-options.js');

function parse(argv) {
  return parseCommandLineOptions(['node', 'script.js'].concat(argv));
}

describe('Command Line Interface', function () {
  // Command line parser uses commander which has global state.
  // To be able to test different command-line combinations,
  // we'll need to reset the state between tests.
  beforeEach(function() {
    commander.outFile = undefined;
    commander.enable = undefined;
    commander.disable = undefined;
    commander.module = undefined;
  });

  it('by default reads STDIN and writes to STDOUT', function() {
    var options = parse([]);
    expect(options.inFile).to.equal(undefined);
    expect(options.outFile).to.equal(undefined);
  });

  it('when existing <filename> given reads <filename> and writes to STDOUT', function() {
    var options = parse(['lib/io.js']);
    expect(options.inFile).to.equal('lib/io.js');
    expect(options.outFile).to.equal(undefined);
  });

  it('when not-existing <filename> given raises error', function() {
    expect(function() {
      parse(['missing.js']);
    }).to.throw('File missing.js does not exist.')
  });

  it('when more than one <filename> given raises error', function() {
    expect(function() {
      parse(['lib/io.js', 'lib/transformer.js']);
    }).to.throw('Only one input file allowed, but 2 given instead.')
  });

  it('when --out-file <filename> given writes <filename> and reads STDIN', function() {
    var options = parse(['--out-file', 'some/file.js']);
    expect(options.inFile).to.equal(undefined);
    expect(options.outFile).to.equal('some/file.js');
  });

  it('by default enables all transforms', function() {
    var options = parse([]);
    expect(options.transformers).to.deep.equal({
      'class': true,
      'template': true,
      'arrow': true,
      'let': true,
      'default-param': true,
      'obj-method': true,
      'obj-shorthand': true,
      'no-strict': true,
      'commonjs': true,
    });
  });

  it('when --enable=let,no-strict,commonjs given, enables only these transformers', function() {
    var options = parse(['--enable', 'let,no-strict,commonjs']);
    expect(options.transformers).to.deep.equal({
      'class': false,
      'template': false,
      'arrow': false,
      'let': true,
      'default-param': false,
      'obj-method': false,
      'obj-shorthand': false,
      'no-strict': true,
      'commonjs': true,
    });
  });

  it('when --enable=unknown given, raises error', function() {
    expect(function() {
      parse(['--enable', 'unknown']);
    }).to.throw('Unknown transformer "unknown".');
  });

  it('when --disable=let,no-strict,commonjs given, disables the specified transformers', function() {
    var options = parse(['--disable', 'let,no-strict,commonjs']);
    expect(options.transformers).to.deep.equal({
      'class': true,
      'template': true,
      'arrow': true,
      'let': false,
      'default-param': true,
      'obj-method': true,
      'obj-shorthand': true,
      'no-strict': false,
      'commonjs': false,
    });
  });

  it('when --disable=unknown given, raises error', function() {
    expect(function() {
      parse(['--disable', 'unknown']);
    }).to.throw('Unknown transformer "unknown".');
  });

  it('when --enable and --disable used together, raises error', function() {
    expect(function() {
      parse(['--enable', 'let', '--disable', 'let']);
    }).to.throw('Options --enable and --disable can not be used together.');
  });

});