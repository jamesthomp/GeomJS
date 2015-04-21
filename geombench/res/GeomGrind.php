<?php
/**
 * @author Mike
 */
 
if (!defined('MEDIAWIKI')) 
    die("This is an extension to the MediaWiki package and cannot be run standalone.");
 
// Register as an extention
$wgExtensionCredits['parserhook'][] = array(
    'name' => 'GeomGrind',
    'version' => '0.0',
    'url' => '',
    'author' => 'Mike Spivey',
    'description' => 'Formatting of formulas and GeomLab code'
);
 
$wgExtensionFunctions[] = 'wfGrindSetup';

// Hook into the right places
function wfGrindSetup() {
    global $wgHooks, $wgParser;

    $wgHooks['InternalParseBeforeLinks'][] = 'wfGrindExpand';
}
 
// Expand @..@ and @@...@@
function wfGrindExpand(&$parser, &$text, &$stripState) {
    global $wgGrindParser, $wgGrindLanguage;

    // Save reference to parser for use by callbacks
    $wgGrindParser = $parser;

    // Replace '@@...@@' by quoted stuff
    $text = preg_replace_callback(
        '/([^\\\\]|^)@@((@?([^@\\\\\n]|\\\\[^\n]))*)@@/',
        'wfGrindQuote', $text);

    // ... and '@...@' by '<code>...</code>' 
    $text = preg_replace_callback(
        '/([^@\\\\]|^)@(([^@\\\\\n]|\\\\[^\n])*)@/',
        'wfGrindCode', $text);

    // ... and '\@' by '@'.
    $text = str_replace('\\@', '@', $text);

    $wgGrindParser = null;

    return true;
}

// Callback for @...@: match[1] is the left context, match[2] the text
function wfGrindCode($match) {
    global $wgGrindParser;

    // Allow backslash escapes
    $text = preg_replace('/\\\\(.)/', '$1', $match[2]);

    // Shelve the text to protect it from mangling by later processing
    $text = $wgGrindParser->insertStripItem($text);

    return $match[1] . "<code>" . $text . "</code>";
}

// Callback for @@...@@: match[1] is the left context, match[2] the text
function wfGrindQuote($match) {
    global $wgGrindParser, $wgGrindLanguage;
    $text = wfGrindFormat($match[2]);
    $text = $wgGrindParser->insertStripItem($text);
    return $match[1] . $text;
}

// Format $text as a fragment of maths
function wfGrindFormat($text) {
    global $wgGrindSymbols, $wgGrindGreek;

    if ($wgGrindSymbols == null)
        wfGrindLoad();

    // Greek letters 'a, 'b, etc.
    $text = 
        preg_replace(array_keys($wgGrindGreek),
	    array_values($wgGrindGreek), $text);

    // Identifiers in italic
    $text = preg_replace_callback(
        "/([^&A-Za-z_]|^)([A-Za-z]+'*)([0-9]*)(_([a-z]))?/", 
	'wfGrindIdent', $text);

    // Various fancy signs
    $text = strtr($text, $wgGrindSymbols);

    return $text;
}

// Format an identifier: match[1] is the left context, 
//   [2] the identifier, [3] a possible subscript, [5] an italic subscript
function wfGrindIdent($match) {
    $word = $match[2];
    $word = "<i>$word</i>";
    $subs = $match[3];
    $subs2 = $match[5];

    // $word .= "/$subs/$subs2/";

    if ($subs != '')
        $word .= "<sub>$subs</sub>";
    if ($subs2 != '')
        $word .= "<sub><i>$subs2</i></sub>";

    return $match[1] . $word;
}

function wfGrindSymbol($code) {
    return "<span class=\"at_symbol\">$code</span>";
}

$wgGrindSymbols = null;

// Look in the wiki for lists of keywords and symbols.
function wfGrindLoad() {
    global $wgGrindSymbols, $wgGrindGreek;

    // I'm hoping this fails gracefully if the template doesn't exist
    $text = wfGrindFetchMediaWiki('MathSymbols');
    $lines = preg_split('/\n/', $text, -1, PREG_SPLIT_NO_EMPTY);
    $wgGrindSymbols = array();
    foreach ($lines as $line) {
        if (substr($line, 0, 1) != "|") continue;
        $fields = preg_split('/\\|/', $line, -1, PREG_SPLIT_NO_EMPTY);
	$wgGrindSymbols[$fields[0]] = wfGrindSymbol($fields[1]);
    }

    $greek = 
        array('a' => 'alpha', 'b' => 'beta', 'c' => 'gamma',
            'd' => 'delta', 'e' => 'epsilon', 'f' => 'phi', 'h' => 'eta',
            'i' => 'iota', 'k' => 'kappa', 'm' => 'mu', 'n' => 'nu',
            'o' => 'omicron', 'p' => 'pi', 'q' => 'theta', 'r' => 'rho', 
            's' => 'sigma', 't' => 'tau', 'u' => 'upsilon', 'w' => 'omega',
            'x' => 'xi', 'z' => 'zeta');

    $wgGrindGreek = array();
    foreach ($greek as $k => $v) {
        $wgGrindGreek["/'$k([^'a-z]|$)/"] = "&$v;\\1";
        $wgGrindGreek["/'_$k([^'a-z]|$)/"] = "_&$v;\\1";
    }
}

// Fetch a meta-page from the wiki
function wfGrindFetchMediaWiki($name) {
    $title = Title::newFromText("MediaWiki:$name");
    $article = new Article($title);
    return $article->getContent();
}

?>
