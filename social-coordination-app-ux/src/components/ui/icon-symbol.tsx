// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings.
 */
const MAPPING: IconMapping = {
    // Existing
    'house.fill': 'home',
    'paperplane.fill': 'send',
    'chevron.left.forwardslash.chevron.right': 'code',
    'chevron.right': 'chevron-right',

    // Navigation tabs
    calendar: 'event',
    'person.2.fill': 'group',
    'bell.fill': 'notifications',
    person: 'person',

    // Actions
    add: 'add',
    'arrow-back': 'arrow-back',
    share: 'share',
    'more-vert': 'more-vert',
    search: 'search',
    settings: 'settings',
    close: 'close',

    // Content icons
    place: 'place',
    schedule: 'schedule',
    chat: 'chat',
    help: 'help-outline',
    logout: 'logout',
    'person-add': 'person-add',
    check: 'check',
    'content-copy': 'content-copy',
    edit: 'edit',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    return (
        <MaterialIcons
            color={color}
            size={size}
            name={MAPPING[name]}
            style={style}
        />
    );
}
