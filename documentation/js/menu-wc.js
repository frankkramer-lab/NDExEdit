'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">ndex-edit documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-6e16853e3ee73ba2e91566bede701351"' : 'data-target="#xs-components-links-module-AppModule-6e16853e3ee73ba2e91566bede701351"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-6e16853e3ee73ba2e91566bede701351"' :
                                            'id="xs-components-links-module-AppModule-6e16853e3ee73ba2e91566bede701351"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainGraphComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MainGraphComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainInfoComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MainInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainStatsComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">MainStatsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarCompareComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SidebarCompareComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarEditComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SidebarEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarManageComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">SidebarManageComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AppPage.html" data-type="entity-link">AppPage</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/DataService.html" data-type="entity-link">DataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GraphService.html" data-type="entity-link">GraphService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParseService.html" data-type="entity-link">ParseService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/NeContinuousMap.html" data-type="entity-link">NeContinuousMap</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeConversionDetails.html" data-type="entity-link">NeConversionDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeConversionMap.html" data-type="entity-link">NeConversionMap</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeEdge.html" data-type="entity-link">NeEdge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeElement.html" data-type="entity-link">NeElement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeElementAttribute.html" data-type="entity-link">NeElementAttribute</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeGlobalMappings.html" data-type="entity-link">NeGlobalMappings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeMappings.html" data-type="entity-link">NeMappings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeMappingsCollection.html" data-type="entity-link">NeMappingsCollection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeMappingsDefinition.html" data-type="entity-link">NeMappingsDefinition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeNetwork.html" data-type="entity-link">NeNetwork</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeNetworkInformation.html" data-type="entity-link">NeNetworkInformation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeNode.html" data-type="entity-link">NeNode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NePosition.html" data-type="entity-link">NePosition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeStyle.html" data-type="entity-link">NeStyle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NeStyleComponent.html" data-type="entity-link">NeStyleComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});