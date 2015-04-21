<?php
if( !defined( 'MEDIAWIKI' ) ) {
    die( -1 );
}

$wgValidSkinNames['geomskin'] = 'GeomSkin';

/**
 * SkinTemplate class for GeomSkin skin
 * @ingroup Skins
 */
class SkinGeomSkin extends SkinTemplate {

    protected static $bodyClasses = array( 'winkel-animateLayout' );

    var $skinname = 'geomskin', $stylename = 'GeomSkin',
        $template = 'GeomSkinTemplate', $useHeadElement = true;

    /**
     * Initializes output page and sets up skin-specific parameters
     * @param $out OutputPage object to initialize
     */
    public function initPage( OutputPage $out ) {
        global $wgLocalStylePath;

        parent::initPage( $out );

        // Append CSS which includes IE only behavior fixes for hover support -
        // this is better than including this in a CSS fille since it doesn't
        // wait for the CSS file to load before fetching the HTC file.
        $min = $this->getRequest()->getFuzzyBool( 'debug' ) ? '' : '.min';
        $out->addHeadItem( 'csshover',
            '<!--[if lt IE 7]><style type="text/css">body{behavior:url("' .
                htmlspecialchars( $wgLocalStylePath ) .
                "/{$this->stylename}/csshover{$min}.htc\")}</style><![endif]-->"
        );

        $out->addModuleScripts( 'skins.geomskin' );
        $out->addStyle('common/commonElements.css', 'screen');
        $out->addStyle('common/commonContent.css', 'screen');
        $out->addStyle('common/commonInterface.css', 'screen');
        $out->addStyle('GeomSkin/screen.css', 'screen');
    }

    /**
     * Load skin and user CSS files in the correct order
     * fixes bug 22916
     * @param $out OutputPage object
     */
    function setupSkinUserCss( OutputPage $out ){
        parent::setupSkinUserCss( $out );
        $out->addModuleStyles( 'skins.geomskin' );
    }

    /**
     * Adds classes to the body element.
     * 
     * @param $out OutputPage object
     * @param &$bodyAttrs Array of attributes that will be set on the body element
     */
    function addToBodyAttributes( $out, &$bodyAttrs ) {
        if ( isset( $bodyAttrs['class'] ) && strlen( $bodyAttrs['class'] ) > 0 ) {
            $bodyAttrs['class'] .= ' ' . implode( ' ', static::$bodyClasses );
        } else {
            $bodyAttrs['class'] = implode( ' ', static::$bodyClasses );
        }
    }
}

/**
 * QuickTemplate class for GeomSkin skin
 * @ingroup Skins
 */
class GeomSkinTemplate extends BaseTemplate {

    /* Functions */

    /**
     * Outputs the entire contents of the (X)HTML page
     */
    public function execute() {
        // Output HTML Page
        $this->html( 'headelement' );
?>
        <div id="mw-page-base" class="noprint"></div>
        <div id="mw-head-base" class="noprint"></div>
        <!-- content -->
        <div id="content" class="mw-body">
            <a id="top"></a>
            <?php if ( $this->data['sitenotice'] ): ?>
            <!-- sitenotice -->
            <div id="siteNotice"><?php $this->html( 'sitenotice' ) ?></div>
            <!-- /sitenotice -->
            <?php endif; ?>
            <!-- firstHeading -->
            <h1 id="firstHeading" class="firstHeading"><span dir="auto"><?php $this->html( 'title' ) ?></span></h1>
            <!-- /firstHeading -->
            <!-- bodyContent -->
            <div id="bodyContent">
                <?php if ( $this->data['isarticle'] ): ?>
                <!-- tagline -->
                <div id="siteSub"><?php $this->msg( 'tagline' ) ?></div>
                <!-- /tagline -->
                <?php endif; ?>
                <!-- subtitle -->
                <div id="contentSub"<?php $this->html( 'userlangattributes' ) ?>><?php $this->html( 'subtitle' ) ?></div>
                <!-- /subtitle -->
                <!-- bodycontent -->
                <?php $this->html( 'bodycontent' ) ?>
                <!-- /bodycontent -->
                <?php if ( $this->data['printfooter'] ): ?>
                <!-- printfooter -->
                <div class="printfooter">
                <?php $this->html( 'printfooter' ); ?>
                </div>
                <!-- /printfooter -->
                <?php endif; ?>
                <div class="visualClear"></div>
                <!-- debughtml -->
                <?php $this->html( 'debughtml' ); ?>
                <!-- /debughtml -->
            </div>
            <!-- /bodyContent -->
        </div>
        <!-- /content -->
        <!-- header -->
        <div id="mw-head" class="noprint">
	    <div id="mw-logo"></div>
            <?php $this->renderSearch(); ?>
	    <p><?php $msgObj = wfMessage( 'strapline' ); echo htmlspecialchars( $msgObj->exists() ? $msgObj->text() : $msg ); ?></p>
        </div>
        <!-- /header -->
        <!-- panel -->
            <div id="mw-panel" class="noprint">
                <?php $this->renderPortals( $this->data['sidebar'] ); ?>
            </div>
        <!-- /panel -->
        <!-- footer -->
        <div id="footer"<?php $this->html( 'userlangattributes' ) ?>>
            <?php $footericons = $this->getFooterIcons("icononly");
            if ( count( $footericons ) > 0 ): ?>
                <ul id="footer-icons" class="noprint">
<?php            foreach ( $footericons as $blockName => $footerIcons ): ?>
                    <li id="footer-<?php echo htmlspecialchars( $blockName ); ?>ico">
<?php                foreach ( $footerIcons as $icon ): ?>
                        <?php echo $this->getSkin()->makeFooterIcon( $icon ); ?>

<?php                endforeach; ?>
                    </li>
<?php            endforeach; ?>
                </ul>
            <?php endif; ?>
            <?php foreach( $this->getFooterLinks() as $category => $links ): ?>
                <ul id="footer-<?php echo $category ?>">
                    <?php foreach( $links as $link ): ?>
                        <li id="footer-<?php echo $category ?>-<?php echo $link ?>"><?php $this->html( $link ) ?></li>
                    <?php endforeach; ?>
                </ul>
            <?php endforeach; ?>
            <div style="clear:both"></div>
        </div>
        <!-- /footer -->
        <?php $this->printTrail(); ?>

    </body>
</html>
<?php
    }

    /**
     * Render a series of portals
     *
     * @param $portals array
     */
    protected function renderPortals( $portals ) {
        // Render portals
        foreach ( $portals as $name => $content ) {
            if ( $content === false )
                continue;

            echo "\n<!-- {$name} -->\n";
            $this->renderPortal( $name, $content );
            echo "\n<!-- /{$name} -->\n";
        }
    }

    /**
     * @param $name string
     * @param $content array
     * @param $msg null|string
     * @param $hook null|string|array
     */
    protected function renderPortal( $name, $content, $msg = null, $hook = null ) {
        if ( $msg === null ) {
            $msg = $name;
        }
        ?>
<div class="portal" id='<?php echo Sanitizer::escapeId( "p-$name" ) ?>'<?php echo Linker::tooltip( 'p-' . $name ) ?>>
    <h5<?php $this->html( 'userlangattributes' ) ?>><?php $msgObj = wfMessage( $msg ); echo htmlspecialchars( $msgObj->exists() ? $msgObj->text() : $msg ); ?></h5>
    <div class="body">
<?php
        if ( is_array( $content ) ): ?>
        <ul>
<?php
            foreach( $content as $key => $val ): ?>
            <?php echo $this->makeListItem( $key, $val ); ?>

<?php
            endforeach;
            if ( $hook !== null ) {
                wfRunHooks( $hook, array( &$this, true ) );
            }
            ?>
        </ul>
<?php
        else: ?>
        <?php echo $content; /* Allow raw HTML block to be defined by extensions */ ?>
<?php
        endif; ?>
    </div>
</div>
<?php
    }

    protected function renderSearch() {
                    echo "\n<!-- SEARCH -->\n";
?>
<div id="p-search">
    <h5<?php $this->html( 'userlangattributes' ) ?>><label for="searchInput"><?php $this->msg( 'search' ) ?></label></h5>
    <form action="<?php $this->text( 'wgScript' ) ?>" id="searchform">
        <div id="simpleSearch">
            <?php if ( $this->data['rtl'] ): ?>
            <?php echo $this->makeSearchButton( 'image', array( 'id' => 'searchButton', 'src' => $this->getSkin()->getSkinStylePath( 'images/search-rtl.png' ), 'width' => '12', 'height' => '13' ) ); ?>
            <?php endif; ?>
            <?php echo $this->makeSearchInput( array( 'id' => 'searchInput', 'type' => 'text' ) ); ?>
            <?php if ( !$this->data['rtl'] ): ?>
            <?php echo $this->makeSearchButton( 'image', array( 'id' => 'searchButton', 'src' => $this->getSkin()->getSkinStylePath( 'images/search-ltr.png' ), 'width' => '12', 'height' => '13' ) ); ?>
            <?php endif; ?>
            <input type='hidden' name="title" value="<?php $this->text( 'searchtitle' ) ?>"/>
        </div>
    </form>
</div>
<?php
                echo "<!-- /SEARCH -->\n";
    }
}
