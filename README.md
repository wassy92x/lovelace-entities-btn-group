# Entities Button Group

A custom card for Home Assistant to group multiple buttons ([Custom-ButtonCard](https://github.com/custom-cards/button-card))

[![GitHub Release][releases-shield]][releases]
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)
[![License][license-shield]](LICENSE.md)

![Image of Entities Button Group](https://github.com/wassy92x/lovelace-entities-btn-group/blob/master/.images/entities-btn-group.png?raw=true)

### Options

| Name              | Type                | Requirement  | Description                                     | Default             |
| ----------------- | ------------------- | ------------ | ----------------------------------------------- | ------------------- |
| type              | string              | **Required** | `custom:entities-btn-group`                  |                     |
| title             | string              | **Optional** | Title of group                                  |                     |
| entities          | (object &#124; string)[] | **Optional** | Entities to show inside button group            |                     |

## Entity
One entity can be either an string (the entity_id) or an object.
If it's a string, the domain (for example sensor, climate, binary_sensor etc.) will be computed and used as the template for the button.
If it's an object and there is an key called `template`, this template will be used for the button.
If it's an object but there is no key called `template`, the domain will be computed based on the entity, set by the key `entity`, and used as the template.

For templates see the documentation of [custom button card](https://github.com/custom-cards/button-card#configuration-templates)
If there is no template with name of the domain, the template called `default` will be used.

For the entities you can use every valid config-key of the custom button card.


# Styling
The card is stylable by some css variables.

| Name                                 | Description                                 | Default                                                                       |
| ------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------- |
| --entities-btn-group-grid-template   | Grid column template                        | repeat(auto-fill, minmax(min(var(--entities-btn-group-item-min-width), 100% / var(--entities-btn-group-min-num-col) - (var(--entities-btn-group-min-num-col) - 1) * (var(--entities-btn-group-gap) / 2)), 1fr)) |
| --entities-btn-group-gap             | Gap size between columns and rows           | 10px |
| --entities-btn-group-item-min-width  | Minimum width of one button (please not that the minimum number of columns has a higher priority) | 85px |
| --entities-btn-group-item-max-width  | Maximum width of one button                 | 125px |
| --entities-btn-group-min-num-col     | Minimum number of columns                   | 2 |

# Examples
## Simple Entities
```
type: 'custom:entities-btn-group'
title: Wohnzimmer
entities:
  - light.fernsehbeleuchtung
  - entity: var.state_spulmaschine
    name: Spülmaschine
  - media_player.mymediaplayer
```

## Camera (MJPEG-Stream without Home Assistant Proxy)
```
type: 'custom:entities-btn-group'
title: Wohnzimmer
entities:
  - template:
      - camera
    variables:
      pictureUrl: https://mycamera.com
    name: Kamera
```

## Camera Entity
```
type: 'custom:entities-btn-group'
title: Wohnzimmer
entities:
  - camera.mycamera
```

Also you have to change the below mentioned camera-template to:
```
  camera:
    template:
      - default
    show_entity_picture: true
    styles:
      entity_picture:
        - width: 95%
        - height: 100%
        - border-radius: 5px
```

## Climate
```
type: 'custom:entities-btn-group'
title: Wohnzimmer
entities:
  - entity: climate.kueche_thermostat
    variables:
      humidityEntity: sensor.kuche_feuchtigkeit
      curTempEntity: sensor.kuche_temperatur
```
*Note: The above metioned variables could be ommitted. In this case the humidity will not be shown and the current temerature will be read from the climate-entity.*


## And at the root level of your lovelace configuration you have to set:
```
button_card_templates:
  default:
    aspect_ratio: 1/1
    styles:
      card:
        - border-radius: 10px
        - box-shadow: none
        - transition: none
      name:
        - font-size: 0.8em
  light:
    template:
      - default
    custom_fields:
      brightness: >
        [[[ if (entity && entity.attributes && entity.attributes.brightness) {
        return Math.round(entity.attributes.brightness * (100 / 255)) + '%' }
        return '' ]]]
    styles:
      custom_fields:
        brightness:
          - position: absolute
          - right: 5px
          - top: 5px
          - font-size: 0.85em
    double_tap_action:
      action: call-service
      service: browser_mod.popup
      service_data:
        title: '[[[ return entity.attributes.friendly_name ]]]'
        card:
          type: custom:light-entity-card
          entity: '[[[ return entity.entity_id ]]]'
  var:
    template:
      - default
    show_state: true
    styles:
      state:
        - bottom: calc(25% - 0.4em)
        - position: absolute
        - width: 100%
        - text-align: center
        - font-size: 0.8em
        - font-weight: bold
  media_player:
    template:
      - default
    show_entity_picture: true
    styles:
      entity_picture:
        - width: 95%
        - height: 100%
        - border-radius: 5px
  climate:
    template:
      - default
    show_icon: false
    show_state: true
    show_name: false
    tap_action:
      action: call-service
      service: browser_mod.popup
      service_data:
        title: '[[[ return entity.attributes.friendly_name ]]]'
        card:
          type: custom:simple-thermostat
          entity: '[[[ return entity.entity_id ]]]'
          hide:
            temperature: '[[[ return variables && variables.curTempEntity ]]]'
          sensors:
            - entity: '[[[ return variables && variables.curTempEntity ]]]'
              name: Temperatur
            - entity: '[[[ return variables && variables.humidityEntity ]]]'
              name: Feuchtigkeit
          step_size: 0.5
    custom_fields:
      curTemp: >
        [[[ if (variables && variables.curTempEntity &&
        states[variables.curTempEntity]) { return
        (Math.round(states[variables.curTempEntity].state * 10) / 10) +
        states[variables.curTempEntity].attributes.unit_of_measurement } else if
        (entity && entity.attributes) { return
        (Math.round(entity.attributes.current_temperature * 10) / 10) + '°C' }
        return '' ]]]
      targetTemp: >
        [[[ if (entity && entity.attributes) { return
        entity.attributes.temperature + '°C' } return '' ]]]
      humidity: >
        [[[ if (variables && variables.humidityEntity &&
        states[variables.humidityEntity]) { return
        (Math.round(states[variables.humidityEntity].state * 10) / 10) +
        states[variables.humidityEntity].attributes.unit_of_measurement } return
        '' ]]]
    styles:
      state:
        - bottom: 5px
        - position: absolute
        - width: 100%
        - text-align: center
        - font-size: 0.8em
      custom_fields:
        curTemp:
          - position: absolute
          - left: 0
          - top: calc(50% - 0.6em)
          - width: 100%
          - font-size: 1.2em
        targetTemp:
          - position: absolute
          - right: 5px
          - top: 5px
          - font-size: 0.85em
        humidity:
          - position: absolute
          - left: 5px
          - top: 5px
          - font-size: 0.85em
  camera:
    template:
      - default
    show_entity_picture: true
    entity_picture: '[[[ return variables.pictureUrl ]]]'
    styles:
      entity_picture:
        - width: 95%
        - height: 100%
        - border-radius: 5px
    tap_action:
      action: url
      url_path: '[[[ return variables.pictureUrl ]]]'
```

[license-shield]: https://img.shields.io/github/license/wassy92x/lovelace-entities-btn-group.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/wassy92x/lovelace-entities-btn-group.svg?style=for-the-badge
[releases]: https://github.com/wassy92x/lovelace-entities-btn-group/releases
