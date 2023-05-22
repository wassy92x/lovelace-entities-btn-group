/* eslint-disable @typescript-eslint/no-explicit-any */
import {css, CSSResult, html, LitElement, PropertyValues, TemplateResult,} from 'lit';
import {customElement, property, state} from 'lit/decorators';
import {computeDomain, HomeAssistant, LovelaceCard, LovelaceCardEditor} from 'custom-card-helpers';
import {createCard} from 'card-tools/src/lovelace-element';
import {CARD_VERSION} from './const';
import IEntitiesButtonGroupConfig from './IEntitiesButtonGroupConfig';

/* eslint no-console: 0 */
console.info(
    `%c  Entities-Button-Group \n%c  Version ${CARD_VERSION}    `,
    'color: orange; font-weight: bold; background: black',
    'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'entities-button-group',
    name: 'EntitiesButtonGroup',
    description: 'Component for multiple floating buttons',
});

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export const getLovelace = (): any | null => {
    let root: any = document.querySelector('home-assistant');
    root = root && root.shadowRoot;
    root = root && root.querySelector('home-assistant-main');
    root = root && root.shadowRoot;
    root = root && root.querySelector('ha-drawer');
    root = root && root.querySelector('partial-panel-resolver');
    root = root && root.shadowRoot || root;
    root = root && root.querySelector('ha-panel-lovelace');
    root = root && root.shadowRoot;
    root = root && root.querySelector('hui-root');
    if (root) {
        const ll = root.lovelace;
        // eslint-disable-next-line @typescript-eslint/camelcase
        ll.current_view = root.___curView;
        return ll;
    }
    return null;
}

@customElement('entities-btn-group')
export class EntitiesButtonGroup extends LitElement {
    @property({attribute: false}) public hass!: HomeAssistant;
    @state() protected _config!: IEntitiesButtonGroupConfig;
    @state() protected _buttons?: LovelaceCard[];

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        const stackCard = createCard({
            type: 'entities',
            entities: []
        });
        return stackCard.constructor.getConfigElement();
    }

    public static getStubConfig(): DeepPartial<IEntitiesButtonGroupConfig> {
        return {
            entities: []
        };
    }

    public setConfig(config: IEntitiesButtonGroupConfig): void {
        if (!config)
            throw new Error('Invalid configuration');

        this._config = config;
        const lovelace = getLovelace();
        this._buttons = config.entities?.map((entityConfig: string | any) => {
            const config: any = {type: 'custom:button-card'};
            if (typeof entityConfig === 'string') {
                config.entity = entityConfig;
                const entityDomain = computeDomain(entityConfig);
                config.template = lovelace?.config?.button_card_templates?.[entityDomain] ? [entityDomain] : ['default'];
            } else {
                Object.assign(config, entityConfig);
                config.template = Array.isArray(config.template) ? Array.from(config.template) : [];
                if (entityConfig.entity) {
                    const entityDomain = computeDomain(entityConfig.entity);
                    if (lovelace?.config?.button_card_templates?.[entityDomain])
                        config.template.unshift(entityDomain);
                    else if (config.template.length === 0)
                        config.template.push('default');
                }
            }
            return this._createButton(config);
        }) ?? [];
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (!this._config)
            return false;

        return changedProps.has('_config') ||
            changedProps.has('_buttons') ||
            changedProps.has('hass');
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);

        if (!changedProps.has('hass'))
            return;

        if (this._buttons) {
            for (const element of this._buttons) {
                if (this.hass)
                    element.hass = this.hass;
            }
        }
    }

    private _createButton(cardConfig: any): LovelaceCard {
        const element = createCard(cardConfig) as LovelaceCard;
        if (this.hass)
            element.hass = this.hass;

        element.addEventListener(
            "ll-rebuild",
            (ev) => {
                ev.stopPropagation();
                this._rebuildButton(element, cardConfig);
            },
            {once: true}
        );
        return element;
    }

    private _rebuildButton(cardElToReplace: LovelaceCard, config: any): void {
        const newCardEl = this._createButton(config);
        if (cardElToReplace.parentElement)
            cardElToReplace.parentElement.replaceChild(newCardEl, cardElToReplace);

        this._buttons = this._buttons?.map((curCardEl: LovelaceCard) =>
            curCardEl === cardElToReplace ? newCardEl : curCardEl
        ) ?? [];
    }

    public async getCardSize(): Promise<number> {
        return 3;
    }

    protected render(): TemplateResult | void {
        return html`
            <div class="button-group">
                ${!!this._config.title ?
                        html`<h1>${this._config.title}</h1>` : null
                }
                <div class="content-wrapper">
                    ${this._buttons}
                </div>
            </div>
        `;
    }

    static get styles(): CSSResult {
        return css`
          .button-group {
            width: calc(100% - 16px);
            overflow: hidden;
            height: min-content;
            margin: 0 8px;
          }

          h1 {
            color: var(--primary-text-color, black);
          }

          .content-wrapper {
            display: grid;
            overflow: hidden;
            grid-template-columns: var(--entities-btn-group-grid-template,
            repeat(auto-fill, minmax(min(var(--entities-btn-group-item-min-width, 85px),
            100% / var(--entities-btn-group-min-num-col, 2) - (var(--entities-btn-group-min-num-col, 2) - 1) * (var(--entities-btn-group-gap, 10px) / 2)),
            1fr)));
            grid-column-gap: var(--entities-btn-group-gap, 10px);
            grid-row-gap: var(--entities-btn-group-gap, 10px);
            width: 100%;
            height: min-content;
          }

          .content-wrapper > * {
            max-width: var(--entities-btn-group-item-max-width, 125px);
          }
        `;
    }
}
