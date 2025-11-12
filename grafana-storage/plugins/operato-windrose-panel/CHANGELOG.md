# Changelog ![](https://git.operato.eu/open-source/operato-windrose-panel/-/raw/v1.0.0/src/img/operato-windrose-logo-small.svg)

## 1.2.0

- Fixed wrong wind direction labels.
- Fixed highlighting not tunring off on hover.

## 1.1.1

- Fixed v1.1.0 not being signed with a comunity level.

## 1.1.0

- Added Legend anchor options: top, center, bottom
- Added Legend position options: left, right
- Added option to calculate bucket size automaticaly.
- Implemented automatic bucket size calculation.
- Updated README.md.
- Added error handling on empty data.
- Added limits to setting values.
- Added v1.1.0 to builds.
- Set v1.1.0 as release candidate.

## 1.0.0

- Fixed README.md not displaying images correctly on plugin Overview page.
- Set v1.0.0 as release candidate.

## 0.6.8

- Changed relative paths to absolute paths in Image tags.

## 0.6.7

- Fixed wrong screenshot paths in plugin.json
- Chaned style of WindroseLegend component.
- Set v0.6.7 as release candidate.
- Added v0.6.7 to builds.

## 0.6.6

- Fixed Speed buckets not highlighting due to useState for Color palette swapping.

## 0.6.5

- Added screenshots to plugin.json.
- Added different color palettes.
- Added settings for picking Color palette.
- Update CHANGELOG.md.
- Update README.md to include description of `Color palette` setting.

## 0.6.4

- Minor grammar corrections in CHANGELOG.md.
- Update README.md to include description of `Wind Speed Unit` setting.
- Percent labels on Windrose are now placed at the position with the smallest petals.

## 0.6.3

- Added option to select wind speed unit in panel settings.
- Selected wind speed unit will be correctly displayed in legend and tooltip.

## 0.6.2

- Updated settings descriptions.
- Updated README.md.
- Fixed hovering on legned not afecting bucket borders. 
- Changed legend icons using the same styles as WindrosePanel. 

## 0.6.1

- Improved highlighting.
- Added speed range to tooltips.

## 0.6.0

- Added speed buckets stroke highlighting.

## 0.5.2

- Fixes style indexing problem.

## 0.5.1

- Fixes style indexing problem.
- Added setting to hide legend.
- Added setting to allow legent to overlap with windrose display.

## 0.5.0

- Created logo for Operato Windrose.
- Updated percent values on tings to corelate with petal sizes.

## 0.4.0

- Changed the id of plugin from 'operato-operatowindrose-panel' to 'operato-windrose-panel'.
- Added legend.
- Added compas direction labels.
- Added angle direction labels.
- Added settings to allow user to switch between compas and degree labels.


## 0.3.0

- Added percent labels on rings. (Only placeholder values that do not represent the coresponding values of Windrose petals)
- Tweaks on highlight color values.
- Added tooltip decimal place setting.


## 0.2.0

- Added data processing. Visualization is now done on dynamic data provided by Grafana.
- Added utility functions for manipulating colors.


## 0.1.0

- Initial commit. Added basic Windrose visualization and data parsing. (Only displays static hardcoded data)

