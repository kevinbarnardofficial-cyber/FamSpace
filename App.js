
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  Modal,
  Share,
  useColorScheme,
  StatusBar
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// SUPABASE
// ============================================================

const supabase = createClient(
  'https://srehrmfpvbnnxzjzcsnj.supabase.co',
  'sb_publishable_mhjUK8ipqCB4AAaFoUf7CQ_opT8FUKO',
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

const THEME_KEY = '@famspace_theme';

// ============================================================
// COLOURS
// ============================================================

const PALETTES = {
  light: {
    bg: '#F7F3E8',
    surface: '#FFFFFF',
    soft: '#EDF0E6',
    text: '#14263D',
    muted: '#697687',
    border: '#DFE3DB',
    input: '#FFFFFF',
    olive: '#77834B',
    cyan: '#22B8E6',
    red: '#C54D56',
    header: '#14263D',
    hero: '#14263D'
  },
  dark: {
    bg: '#101B2B',
    surface: '#1B2B40',
    soft: '#283D52',
    text: '#F4F7FA',
    muted: '#ACBBC9',
    border: '#34495D',
    input: '#24394F',
    olive: '#87965B',
    cyan: '#35C6F0',
    red: '#FF858C',
    header: '#14263D',
    hero: '#20364E'
  }
};

// ============================================================
// GROCERY DATA
// ============================================================

const CATEGORIES = [
  'Fruit & Vegetables',
  'Meat & Poultry',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Frozen Foods',
  'Drinks',
  'Snacks',
  'Cleaning',
  'Toiletries',
  'Baby & Pets',
  'Other'
];

const CATEGORY_ICONS = {
  'Fruit & Vegetables': '🥦',
  'Meat & Poultry': '🥩',
  'Dairy & Eggs': '🥛',
  Bakery: '🍞',
  Pantry: '🥫',
  'Frozen Foods': '🧊',
  Drinks: '🥤',
  Snacks: '🍪',
  Cleaning: '🧽',
  Toiletries: '🧴',
  'Baby & Pets': '🐾',
  Other: '🛍️'
};

const STARTER_PRODUCTS = [
  ['Milk', 'Dairy & Eggs', 'L'],
  ['Eggs', 'Dairy & Eggs', 'pack'],
  ['Cheddar Cheese', 'Dairy & Eggs', 'g'],
  ['Yoghurt', 'Dairy & Eggs', 'each'],
  ['Butter', 'Dairy & Eggs', 'g'],
  ['Bread', 'Bakery', 'loaf'],
  ['Bread Rolls', 'Bakery', 'pack'],
  ['Chicken Breasts', 'Meat & Poultry', 'kg'],
  ['Beef Mince', 'Meat & Poultry', 'kg'],
  ['Boerewors', 'Meat & Poultry', 'kg'],
  ['Bacon', 'Meat & Poultry', 'pack'],
  ['Potatoes', 'Fruit & Vegetables', 'kg'],
  ['Onions', 'Fruit & Vegetables', 'kg'],
  ['Tomatoes', 'Fruit & Vegetables', 'kg'],
  ['Carrots', 'Fruit & Vegetables', 'kg'],
  ['Bananas', 'Fruit & Vegetables', 'kg'],
  ['Apples', 'Fruit & Vegetables', 'kg'],
  ['Lettuce', 'Fruit & Vegetables', 'each'],
  ['Rice', 'Pantry', 'kg'],
  ['Pasta', 'Pantry', 'pack'],
  ['Cooking Oil', 'Pantry', 'L'],
  ['Sugar', 'Pantry', 'kg'],
  ['Flour', 'Pantry', 'kg'],
  ['Salt', 'Pantry', 'pack'],
  ['Coffee', 'Drinks', 'pack'],
  ['Tea', 'Drinks', 'pack'],
  ['Cold Drink', 'Drinks', 'L'],
  ['Frozen Vegetables', 'Frozen Foods', 'pack'],
  ['Frozen Chips', 'Frozen Foods', 'kg'],
  ['Biscuits', 'Snacks', 'pack'],
  ['Dishwashing Liquid', 'Cleaning', 'bottle'],
  ['Laundry Detergent', 'Cleaning', 'pack'],
  ['Toilet Paper', 'Toiletries', 'pack'],
  ['Toothpaste', 'Toiletries', 'tube'],
  ['Shampoo', 'Toiletries', 'bottle']
];

const MODULES = {
  Calendar: {
    table: 'calendar_events',
    date: 'event_date',
    label: 'Family Calendar',
    icon: '📅'
  },
  Budget: {
    table: 'budget_entries',
    date: 'entry_date',
    label: 'Family Budget',
    icon: '💰'
  },
  Dinner: {
    table: 'dinner_plans',
    date: 'dinner_date',
    label: 'Dinner Plan',
    icon: '🍽️'
  },
  Tasks: {
    table: 'family_tasks',
    date: 'due_date',
    label: 'Shit to-do',
    icon: '✅'
  }
};

const NAV = [
  ['Home', '🏠', 'Home'],
  ['Calendar', '📅', 'Family Calendar'],
  ['Shopping', '🛒', 'Groceries'],
  ['Budget', '💰', 'Family Budget'],
  ['Dinner', '🍽️', 'Dinner Plan'],
  ['Tasks', '✅', 'Shit to-do'],
  ['Family', '👨‍👩‍👧‍👦', 'My Family'],
  ['Settings', '⚙️', 'Settings']
];

// ============================================================
// HELPERS
// ============================================================

const pad = n => String(n).padStart(2, '0');

function today() {
  const d = new Date();

  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate())
  );
}

function monthKey() {
  return today().slice(0, 7);
}

function rand(value) {
  return (
    'R ' +
    Number(value || 0).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  );
}

function num(value) {
  const n = Number(
    String(value || '').replace(',', '.')
  );

  return Number.isFinite(n) ? n : NaN;
}

function errorMessage(error) {
  return error?.message || String(error);
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [y, m, d] = value.split('-').map(Number);

  const x = new Date(y, m - 1, d);

  return (
    x.getFullYear() === y &&
    x.getMonth() === m - 1 &&
    x.getDate() === d
  );
}

// ============================================================
// STYLES
// ============================================================

function makeStyles(c) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg
    },

    content: {
      paddingHorizontal: 16,
      paddingTop: 13,
      paddingBottom: 60
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bg,
      padding: 20
    },

    header: {
      backgroundColor: c.header,
      paddingTop: Platform.OS === 'ios' ? 52 : 26,
      paddingBottom: 10,
      paddingHorizontal: 17,
      flexDirection: 'row',
      alignItems: 'center'
    },

    headerTitle: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
      letterSpacing: -0.6
    },

    headerSub: {
      color: '#C8D6E0',
      fontSize: 11,
      marginTop: 1
    },

    iconButton: {
      width: 39,
      height: 39,
      borderRadius: 11,
      backgroundColor: '#263D54',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8
    },

    nav: {
      backgroundColor: c.header,
      maxHeight: 60,
      flexGrow: 0
    },

    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 17,
      marginHorizontal: 3
    },

    navText: {
      color: '#D8E2E8',
      fontSize: 12,
      fontWeight: '800'
    },

    title: {
      color: c.text,
      fontSize: 23,
      fontWeight: '900',
      marginBottom: 12
    },

    section: {
      color: c.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 10
    },

    text: {
      color: c.text,
      fontSize: 14
    },

    muted: {
      color: c.muted,
      fontSize: 13,
      lineHeight: 20
    },

    small: {
      color: c.muted,
      fontSize: 12,
      marginTop: 4
    },

    card: {
      backgroundColor: c.surface,
      borderRadius: 17,
      padding: 15,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 12
    },

    input: {
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 11,
      paddingHorizontal: 13,
      paddingVertical: 12,
      color: c.text,
      fontSize: 15
    },

    label: {
      color: c.text,
      fontSize: 13,
      fontWeight: '800',
      marginBottom: 7
    },

    button: {
      backgroundColor: c.olive,
      borderRadius: 12,
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 9
    },

    buttonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center'
    },

    between: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    divider: {
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingVertical: 12
    },

    hero: {
      backgroundColor: c.hero,
      borderRadius: 18,
      paddingHorizontal: 19,
      paddingVertical: 17,
      marginBottom: 18
    },

    heroTitle: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '900',
      marginTop: 7,
      marginBottom: 5
    },

    heroSub: {
      color: '#DFE8EE',
      fontSize: 13
    },

    eyebrow: {
      color: c.cyan,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.8
    },

    stat: {
      width: '48%',
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.border,
      padding: 14,
      marginBottom: 11,
      minHeight: 125
    },

    statValue: {
      color: c.text,
      fontSize: 20,
      fontWeight: '900',
      marginTop: 7
    },

    chip: {
      backgroundColor: c.soft,
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 7,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border
    },

    chipText: {
      color: c.text,
      fontWeight: '700',
      fontSize: 12
    },

    modalShade: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      padding: 18
    },

    modalBox: {
      backgroundColor: c.bg,
      borderRadius: 20,
      padding: 18,
      maxHeight: '88%',
      borderWidth: 1,
      borderColor: c.border
    },

    day: {
      width: '14.2857%',
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10
    },

    groceryItem: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 14,
      padding: 13,
      marginBottom: 9,
      flexDirection: 'row',
      alignItems: 'center'
    },

    progressTrack: {
      height: 9,
      backgroundColor: c.soft,
      borderRadius: 8,
      overflow: 'hidden',
      marginTop: 12
    },

    progressFill: {
      height: '100%',
      backgroundColor: c.olive,
      borderRadius: 8
    },

    invite: {
      color: c.text,
      fontSize: 25,
      fontWeight: '900',
      letterSpacing: 2,
      textAlign: 'center',
      padding: 17,
      backgroundColor: c.soft,
      borderRadius: 12,
      marginVertical: 12
    }
  });
}

// ============================================================
// REUSABLE CONTROLS
// ============================================================

function Btn({
  children,
  onPress,
  c,
  s,
  outline = false,
  disabled = false,
  small = false
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        s.button,
        outline && {
          backgroundColor: c.soft,
          borderWidth: 1,
          borderColor: c.border
        },
        small && {
          padding: 9,
          marginTop: 0
        },
        disabled && {
          opacity: 0.5
        }
      ]}
    >
      <Text
        style={[
          s.buttonText,
          outline && { color: c.text },
          small && { fontSize: 12 }
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function Field({
  label,
  value,
  onChange,
  c,
  s,
  numeric,
  secure,
  multiline,
  placeholder
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>

      <TextInput
        style={[
          s.input,
          multiline && {
            minHeight: 80,
            textAlignVertical: 'top'
          }
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={c.muted}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        autoCapitalize={
          label.toLowerCase().includes('email')
            ? 'none'
            : 'sentences'
        }
      />
    </View>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
  c,
  s
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>

      <TouchableOpacity
        style={s.input}
        onPress={() => setOpen(true)}
      >
        <Text style={s.text}>
          {value || 'Select'} ▾
        </Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.modalShade}>
          <View style={s.modalBox}>
            <Text style={s.section}>{label}</Text>

            <ScrollView style={{ maxHeight: 350 }}>
              {options.map(option => (
                <TouchableOpacity
                  key={String(option)}
                  style={s.divider}
                  onPress={() => {
                    onChange(String(option));
                    setOpen(false);
                  }}
                >
                  <Text style={s.text}>
                    {option}
                    {value === String(option) ? ' ✓' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Btn
              c={c}
              s={s}
              outline
              onPress={() => setOpen(false)}
            >
              Close
            </Btn>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// CALENDAR
// ============================================================

function Calendar({
  value,
  onChange,
  events = [],
  c,
  s
}) {
  const [y, m] = value
    .slice(0, 7)
    .split('-')
    .map(Number);

  const offset = new Date(y, m - 1, 1).getDay();

  const days = new Date(y, m, 0).getDate();

  const cells = [
    ...Array(offset).fill(null),
    ...Array.from(
      { length: days },
      (_, i) => i + 1
    )
  ];

  while (cells.length % 7) {
    cells.push(null);
  }

  const move = amount => {
    const d = new Date(y, m - 1 + amount, 1);

    const day = Math.min(
      Number(value.slice(8)),
      new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0
      ).getDate()
    );

    onChange(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(day)}`
    );
  };

  return (
    <View>
      <View
        style={[
          s.between,
          { marginBottom: 13 }
        ]}
      >
        <Btn
          c={c}
          s={s}
          small
          outline
          onPress={() => move(-1)}
        >
          ‹
        </Btn>

        <Text style={s.section}>
          {new Date(y, m - 1, 1).toLocaleDateString(
            'en-ZA',
            {
              month: 'long',
              year: 'numeric'
            }
          )}
        </Text>

        <Btn
          c={c}
          s={s}
          small
          outline
          onPress={() => move(1)}
        >
          ›
        </Btn>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
          (x, i) => (
            <Text
              key={i}
              style={[
                s.small,
                {
                  width: '14.2857%',
                  textAlign: 'center',
                  fontWeight: '800'
                }
              ]}
            >
              {x}
            </Text>
          )
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap'
        }}
      >
        {cells.map((day, i) => {
          const iso = day
            ? `${y}-${pad(m)}-${pad(day)}`
            : '';

          const marked = events.some(
            e => e.event_date === iso
          );

          return (
            <TouchableOpacity
              key={i}
              disabled={!day}
              style={[
                s.day,
                iso === value && {
                  backgroundColor: c.olive
                }
              ]}
              onPress={() => onChange(iso)}
            >
              <Text
                style={[
                  s.text,
                  iso === value && {
                    color: '#FFFFFF',
                    fontWeight: '800'
                  }
                ]}
              >
                {day || ''}
              </Text>

              {marked && (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    backgroundColor: c.cyan,
                    borderRadius: 3
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DateChoice({
  value,
  onChange,
  c,
  s
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>Date</Text>

      <TouchableOpacity
        style={s.input}
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        <Text style={s.text}>
          {value} ▾
        </Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.modalShade}>
          <View style={s.modalBox}>
            <Calendar
              value={draft}
              onChange={setDraft}
              c={c}
              s={s}
            />

            <Btn
              c={c}
              s={s}
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Use selected date
            </Btn>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const system = useColorScheme();

  const [theme, setTheme] = useState('system');
  const [themeReady, setThemeReady] = useState(false);

  const effective =
    theme === 'system'
      ? system === 'dark'
        ? 'dark'
        : 'light'
      : theme;

  const c = PALETTES[effective];

  const s = useMemo(
    () => makeStyles(c),
    [effective]
  );

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);

  const [families, setFamilies] = useState([]);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);

  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [tab, setTab] = useState('Home');
  const [refresh, setRefresh] = useState(0);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [dashboard, setDashboard] = useState({
    Calendar: [],
    Shopping: [],
    Budget: [],
    Dinner: [],
    Tasks: []
  });

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [selectedDate, setSelectedDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [entryType, setEntryType] = useState('Expense');
  const [priority, setPriority] = useState('Normal');

  // ==========================================================
  // GROCERY STATE
  // ==========================================================

  const [groceryTab, setGroceryTab] = useState('List');

  const [groceryLists, setGroceryLists] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [groceryProducts, setGroceryProducts] = useState([]);

  const [grocerySettings, setGrocerySettings] = useState({
    monthly_budget: 0
  });

  const [activeListId, setActiveListId] = useState(null);

  const [groceryLoading, setGroceryLoading] = useState(false);
  const [grocerySearch, setGrocerySearch] = useState('');
  const [groceryCategory, setGroceryCategory] = useState('All');
  const [groceryModal, setGroceryModal] = useState('');

  const [groceryName, setGroceryName] = useState('');
  const [groceryQty, setGroceryQty] = useState('1');
  const [groceryUnit, setGroceryUnit] = useState('each');
  const [groceryPrice, setGroceryPrice] = useState('0');
  const [groceryActual, setGroceryActual] = useState('');

  const [groceryProductId, setGroceryProductId] = useState(null);
  const [groceryItemId, setGroceryItemId] = useState(null);

  const [groceryNewList, setGroceryNewList] = useState('');
  const [groceryBudgetInput, setGroceryBudgetInput] = useState('0');
  const [groceryFavourite, setGroceryFavourite] = useState(false);

  const reload = () => setRefresh(x => x + 1);

  const showError = (heading, error) => {
    Alert.alert(heading, errorMessage(error));
  };

  // ==========================================================
  // THEME
  // ==========================================================

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(saved => {
        if (
          ['system', 'light', 'dark'].includes(saved)
        ) {
          setTheme(saved);
        }
      })
      .finally(() => setThemeReady(true));
  }, []);

  const changeTheme = async next => {
    setTheme(next);

    try {
      await AsyncStorage.setItem(
        THEME_KEY,
        next
      );
    } catch (e) {
      showError('Theme settings', e);
    }
  };

  // ==========================================================
  // AUTH
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user || null);
          setAuthReady(true);
        }
      }
    );

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setUser(data?.session?.user || null);
          setAuthReady(true);
        }
      })
      .catch(e => {
        if (mounted) {
          console.warn(e);
          setAuthReady(true);
        }
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================================
  // FAMILIES
  // ==========================================================

  useEffect(() => {
    if (!user) {
      setFamily(null);
      setFamilies([]);
      setMembers([]);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const {
          data: memberships,
          error: e1
        } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id);

        if (e1) throw e1;

        const ids = [
          ...new Set(
            (memberships || []).map(
              x => x.family_id
            )
          )
        ];

        if (!ids.length) {
          if (mounted) {
            setFamilies([]);
            setFamily(null);
          }

          return;
        }

        const { data, error } = await supabase
          .from('families')
          .select('id,name,invite_code,created_by')
          .in('id', ids);

        if (error) throw error;

        if (mounted) {
          setFamilies(data || []);

          setFamily(
            prev =>
              (data || []).find(
                x => x.id === prev?.id
              ) ||
              data?.[0] ||
              null
          );
        }
      } catch (e) {
        if (mounted) {
          showError('Family loading', e);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user?.id, refresh]);

  useEffect(() => {
    if (!family) {
      setMembers([]);
      return;
    }

    let mounted = true;

    supabase
      .from('family_members')
      .select(
        'id,user_id,display_name,role,joined_at'
      )
      .eq('family_id', family.id)
      .order('joined_at')
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          showError('Family members', error);
        } else {
          setMembers(data || []);
        }
      });

    return () => {
      mounted = false;
    };
  }, [family?.id, refresh]);

  // ==========================================================
  // LOAD GROCERIES
  // ==========================================================

  const loadGroceries = useCallback(async () => {
    if (!family) return;

    setGroceryLoading(true);

    try {
      const fid = family.id;

      const results = await Promise.all([
        supabase
          .from('grocery_lists')
          .select('*')
          .eq('family_id', fid)
          .order('created_at', {
            ascending: false
          }),

        supabase
          .from('grocery_list_items')
          .select('*')
          .eq('family_id', fid)
          .order('created_at'),

        supabase
          .from('grocery_products')
          .select('*')
          .eq('family_id', fid)
          .order('name'),

        supabase
          .from('grocery_settings')
          .select('*')
          .eq('family_id', fid)
          .maybeSingle()
      ]);

      for (const result of results) {
        if (result.error) {
          throw result.error;
        }
      }

      setGroceryLists(
        results[0].data || []
      );

      setGroceryItems(
        results[1].data || []
      );

      setGroceryProducts(
        results[2].data || []
      );

      const settings =
        results[3].data || {
          monthly_budget: 0
        };

      setGrocerySettings(settings);

      setGroceryBudgetInput(
        String(settings.monthly_budget || 0)
      );

      const lists =
        results[0].data || [];

      setActiveListId(prev =>
        lists.some(x => x.id === prev)
          ? prev
          : (
              lists.find(
                x => x.status === 'active'
              ) || lists[0]
            )?.id || null
      );
    } catch (e) {
      showError(
        'Grocery loading error',
        e
      );
    } finally {
      setGroceryLoading(false);
    }
  }, [family?.id]);

  useEffect(() => {
    if (!family || !user) return;

    loadGroceries();
  }, [
    family?.id,
    user?.id,
    refresh,
    loadGroceries
  ]);

  // ==========================================================
  // LOAD MODULE DATA
  // ==========================================================

  useEffect(() => {
    if (
      !family ||
      !user ||
      !MODULES[tab]
    ) {
      setRows([]);
      return;
    }

    let mounted = true;

    (async () => {
      setLoading(true);

      try {
        const config =
          MODULES[tab];

        const {
          data,
          error
        } = await supabase
          .from(config.table)
          .select('*')
          .eq('family_id', family.id)
          .order(
            config.date || 'created_at',
            {
              ascending:
                tab === 'Calendar' ||
                tab === 'Dinner'
            }
          );

        if (error) throw error;

        if (mounted) {
          setRows(data || []);
        }
      } catch (e) {
        if (mounted) {
          showError('Loading error', e);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    family?.id,
    user?.id,
    tab,
    refresh
  ]);

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  useEffect(() => {
    if (
      !family ||
      tab !== 'Home'
    ) {
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const keys =
          Object.keys(MODULES);

        const results =
          await Promise.all(
            keys.map(k =>
              supabase
                .from(MODULES[k].table)
                .select('*')
                .eq(
                  'family_id',
                  family.id
                )
            )
          );

        const next = {};

        results.forEach(
          (result, i) => {
            if (result.error) {
              throw result.error;
            }

            next[keys[i]] =
              result.data || [];
          }
        );

        next.Shopping =
          groceryItems;

        if (mounted) {
          setDashboard(next);
        }
      } catch (e) {
        if (mounted) {
          showError(
            'Dashboard error',
            e
          );
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    family?.id,
    tab,
    refresh,
    groceryItems
  ]);

  // ==========================================================
  // ACCOUNT ACTIONS
  // ==========================================================

  async function authenticate() {
    if (
      !email.trim() ||
      !password
    ) {
      return Alert.alert(
        'Missing details',
        'Enter your email and password.'
      );
    }

    setBusy(true);

    try {
      if (register) {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (!data.session) {
          Alert.alert(
            'Check your email',
            'Confirm your email address before signing in.'
          );

          setRegister(false);
        } else {
          setUser(data.user);
        }
      } else {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        setUser(data.user);
      }
    } catch (e) {
      showError(
        'Authentication error',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      return showError(
        'Sign out',
        error
      );
    }

    setUser(null);
    setFamily(null);
    setTab('Home');
    setPassword('');
  }

  async function familyAction(kind) {
    const value = (
      kind === 'create'
        ? familyName
        : inviteCode
    ).trim();

    if (!value) {
      return Alert.alert(
        'Missing information',
        'Enter a family name or invite code.'
      );
    }

    setBusy(true);

    try {
      const { error } =
        await supabase.rpc(
          kind === 'create'
            ? 'create_family'
            : 'join_family',
          kind === 'create'
            ? { family_name: value }
            : { code: value }
        );

      if (error) throw error;

      setFamilyName('');
      setInviteCode('');

      reload();

      Alert.alert(
        'Success',
        kind === 'create'
          ? 'Family created!'
          : 'You have joined the family!'
      );
    } catch (e) {
      showError(
        'Family error',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  function navigate(next) {
    setTab(next);
    setTitle('');
    setNotes('');
    setDate(today());

    if (next === 'Calendar') {
      setSelectedDate(today());
    }
  }

  // ==========================================================
  // MODULE ACTIONS
  // ==========================================================

  async function addModuleItem() {
    const config =
      MODULES[tab];

    if (
      !config ||
      !title.trim()
    ) {
      return Alert.alert(
        'Missing title',
        'Enter a title.'
      );
    }

    if (
      config.date &&
      !validDate(date)
    ) {
      return Alert.alert(
        'Invalid date',
        'Choose a valid date.'
      );
    }

    const record = {
      family_id: family.id,
      created_by: user.id,
      title: title.trim()
    };

    if (config.date) {
      record[config.date] =
        date;
    }

    if (
      [
        'Calendar',
        'Dinner',
        'Tasks'
      ].includes(tab)
    ) {
      record.notes =
        notes.trim();
    }

    if (tab === 'Tasks') {
      record.priority =
        priority;

      record.is_done =
        false;
    }

    if (tab === 'Budget') {
      if (
        !Number.isFinite(num(amount)) ||
        num(amount) < 0 ||
        !amount.trim()
      ) {
        return Alert.alert(
          'Invalid amount',
          'Enter a valid amount.'
        );
      }

      record.amount =
        num(amount);

      record.category =
        entryType === 'Income'
          ? 'Income'
          : category;
    }

    setBusy(true);

    try {
      const { error } =
        await supabase
          .from(config.table)
          .insert(record);

      if (error) throw error;

      setTitle('');
      setNotes('');
      setAmount('');

      reload();
    } catch (e) {
      showError(
        'Save error',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleTask(item) {
    const { error } =
      await supabase
        .from('family_tasks')
        .update({
          is_done: !item.is_done
        })
        .eq('id', item.id)
        .eq(
          'family_id',
          family.id
        );

    if (error) {
      showError(
        'Update error',
        error
      );
    } else {
      reload();
    }
  }

  function confirmDelete(
    table,
    item
  ) {
    Alert.alert(
      'Delete item?',
      `Remove "${item.title || item.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } =
              await supabase
                .from(table)
                .delete()
                .eq(
                  'id',
                  item.id
                )
                .eq(
                  'family_id',
                  family.id
                );

            if (error) {
              showError(
                'Delete error',
                error
              );
            } else {
              reload();
            }
          }
        }
      ]
    );
  }

  // ==========================================================
  // GROCERY CALCULATIONS
  // ==========================================================

  const activeList =
    groceryLists.find(
      x => x.id === activeListId
    ) || null;

  const activeItems =
    groceryItems.filter(
      x => x.list_id === activeListId
    );

  const outstanding =
    activeItems.filter(
      x => !x.is_done
    );

  const estimatedTotal =
    activeItems.reduce(
      (sum, x) =>
        sum +
        Number(x.quantity) *
        Number(
          x.estimated_price || 0
        ),
      0
    );

  const actualTotal =
    activeItems
      .filter(x => x.is_done)
      .reduce(
        (sum, x) =>
          sum +
          Number(x.quantity) *
          Number(
            x.actual_price ??
              x.estimated_price ??
              0
          ),
        0
      );

  const remainingEstimate =
    outstanding.reduce(
      (sum, x) =>
        sum +
        Number(x.quantity) *
        Number(
          x.estimated_price || 0
        ),
      0
    );

  const completedLists =
    groceryLists.filter(
      x => x.status === 'completed'
    );

  const monthSpend =
    completedLists
      .filter(
        x =>
          String(
            x.completed_at || ''
          ).slice(0, 7) === monthKey()
      )
      .reduce(
        (sum, list) =>
          sum +
          groceryItems
            .filter(
              x =>
                x.list_id === list.id &&
                x.is_done
            )
            .reduce(
              (total, item) =>
                total +
                Number(item.quantity) *
                Number(
                  item.actual_price ??
                    item.estimated_price ??
                    0
                ),
              0
            ),
        0
      );

  const budget =
    Number(
      grocerySettings.monthly_budget || 0
    );

  const spentIncludingCurrent =
    monthSpend +
    (
      activeList?.status === 'active'
        ? actualTotal
        : 0
    );

  // ==========================================================
  // GROCERY ACTIONS
  // ==========================================================

  function openGroceryProduct(
    product = null,
    item = null
  ) {
    setGroceryName(
      item?.name ||
        product?.name ||
        ''
    );

    setGroceryQty(
      String(
        item?.quantity || 1
      )
    );

    setGroceryUnit(
      item?.unit ||
        product?.default_unit ||
        'each'
    );

    setGroceryPrice(
      String(
        item?.estimated_price ??
          product?.estimated_price ??
          0
      )
    );

    setGroceryActual(
      item?.actual_price == null
        ? ''
        : String(
            item.actual_price
          )
    );

    setGroceryCategory(
      item?.category ||
        product?.category ||
        'Other'
    );

    setGroceryProductId(
      product?.id ||
        item?.product_id ||
        null
    );

    setGroceryItemId(
      item?.id || null
    );

    setGroceryFavourite(
      !!product?.is_favourite
    );

    setGroceryModal(
      item
        ? 'editItem'
        : 'addItem'
    );
  }

  async function createGroceryList() {
    if (
      !groceryNewList.trim()
    ) {
      return Alert.alert(
        'List name',
        'Enter a name for the list.'
      );
    }

    setBusy(true);

    try {
      const {
        data,
        error
      } = await supabase
        .from('grocery_lists')
        .insert({
          family_id: family.id,
          created_by: user.id,
          name: groceryNewList.trim(),
          status: 'active'
        })
        .select('id')
        .single();

      if (error) throw error;

      setActiveListId(data.id);
      setGroceryNewList('');
      setGroceryModal('');
      setGroceryTab('List');

      reload();
    } catch (e) {
      showError(
        'Create list',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveGroceryItem() {
    if (!activeList) {
      return Alert.alert(
        'No list',
        'Create or select a grocery list first.'
      );
    }

    if (
      activeList.status !== 'active'
    ) {
      return Alert.alert(
        'Saved list',
        'Open an active list to make changes.'
      );
    }

    if (
      !groceryName.trim()
    ) {
      return Alert.alert(
        'Product name',
        'Enter a product name.'
      );
    }

    if (
      !Number.isFinite(
        num(groceryQty)
      ) ||
      num(groceryQty) <= 0
    ) {
      return Alert.alert(
        'Quantity',
        'Enter a quantity greater than zero.'
      );
    }

    if (
      !Number.isFinite(
        num(groceryPrice)
      ) ||
      num(groceryPrice) < 0
    ) {
      return Alert.alert(
        'Price',
        'Enter a valid estimated price.'
      );
    }

    if (
      groceryActual.trim() &&
      (
        !Number.isFinite(
          num(groceryActual)
        ) ||
        num(groceryActual) < 0
      )
    ) {
      return Alert.alert(
        'Price',
        'Enter a valid actual price.'
      );
    }

    setBusy(true);

    try {
      const record = {
        family_id: family.id,
        list_id: activeList.id,
        product_id:
          groceryProductId || null,
        name: groceryName.trim(),
        category: groceryCategory,
        quantity: num(groceryQty),
        unit: groceryUnit,
        estimated_price:
          num(groceryPrice),
        actual_price:
          groceryActual.trim()
            ? num(groceryActual)
            : null
      };

      let result;

      if (groceryItemId) {
        result =
          await supabase
            .from('grocery_list_items')
            .update(record)
            .eq(
              'id',
              groceryItemId
            )
            .eq(
              'family_id',
              family.id
            );
      } else {
        result =
          await supabase
            .from('grocery_list_items')
            .insert({
              ...record,
              created_by: user.id,
              is_done: false
            });
      }

      if (result.error) {
        throw result.error;
      }

      setGroceryModal('');

      reload();
    } catch (e) {
      showError(
        'Save grocery item',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleGroceryItem(item) {
    if (
      activeList?.status !== 'active'
    ) {
      return;
    }

    const { error } =
      await supabase
        .from('grocery_list_items')
        .update({
          is_done: !item.is_done
        })
        .eq('id', item.id)
        .eq(
          'family_id',
          family.id
        );

    if (error) {
      showError(
        'Update grocery item',
        error
      );
    } else {
      reload();
    }
  }

  async function saveCatalogueProduct() {
    if (
      !groceryName.trim()
    ) {
      return Alert.alert(
        'Product',
        'Enter a product name.'
      );
    }

    if (
      !Number.isFinite(
        num(groceryPrice)
      ) ||
      num(groceryPrice) < 0
    ) {
      return Alert.alert(
        'Price',
        'Enter a valid price.'
      );
    }

    setBusy(true);

    try {
      const record = {
        family_id: family.id,
        name: groceryName.trim(),
        category: groceryCategory,
        default_unit: groceryUnit,
        estimated_price:
          num(groceryPrice),
        is_favourite:
          groceryFavourite
      };

      const result =
        groceryProductId
          ? await supabase
              .from('grocery_products')
              .update(record)
              .eq(
                'id',
                groceryProductId
              )
              .eq(
                'family_id',
                family.id
              )
          : await supabase
              .from('grocery_products')
              .insert({
                ...record,
                created_by: user.id
              });

      if (result.error) {
        throw result.error;
      }

      setGroceryModal('');

      reload();
    } catch (e) {
      showError(
        'Save product',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleFavourite(product) {
    if (!product.id) {
      try {
        const { error } =
          await supabase
            .from('grocery_products')
            .insert({
              family_id: family.id,
              created_by: user.id,
              name: product.name,
              category: product.category,
              default_unit:
                product.default_unit,
              estimated_price:
                product.estimated_price || 0,
              is_favourite: true
            });

        if (error) {
          throw error;
        }

        reload();
      } catch (e) {
        showError(
          'Favourite',
          e
        );
      }

      return;
    }

    const { error } =
      await supabase
        .from('grocery_products')
        .update({
          is_favourite:
            !product.is_favourite
        })
        .eq(
          'id',
          product.id
        )
        .eq(
          'family_id',
          family.id
        );

    if (error) {
      showError(
        'Favourite',
        error
      );
    } else {
      reload();
    }
  }

  async function saveGroceryBudget() {
    const value =
      num(groceryBudgetInput);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      return Alert.alert(
        'Invalid budget',
        'Enter a valid monthly budget.'
      );
    }

    setBusy(true);

    try {
      const { error } =
        await supabase
          .from('grocery_settings')
          .upsert(
            {
              family_id: family.id,
              monthly_budget: value,
              updated_at:
                new Date().toISOString()
            },
            {
              onConflict: 'family_id'
            }
          );

      if (error) {
        throw error;
      }

      setGrocerySettings({
        monthly_budget: value
      });

      Alert.alert(
        'Saved',
        'Monthly grocery budget updated.'
      );
    } catch (e) {
      showError(
        'Budget',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function setListStatus(
    list,
    status
  ) {
    setBusy(true);

    try {
      const { error } =
        await supabase
          .from('grocery_lists')
          .update({
            status,
            completed_at:
              status === 'completed'
                ? new Date().toISOString()
                : null
          })
          .eq(
            'id',
            list.id
          )
          .eq(
            'family_id',
            family.id
          );

      if (error) {
        throw error;
      }

      reload();
    } catch (e) {
      showError(
        'List status',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  function completeList() {
    if (
      !activeList ||
      activeList.status !== 'active'
    ) {
      return;
    }

    Alert.alert(
      'Finish shopping?',
      'This will move the list into your shopping history. Only ticked items count towards spending.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Finish Shopping',
          onPress: () =>
            setListStatus(
              activeList,
              'completed'
            )
        }
      ]
    );
  }

  async function duplicateList(
    list,
    newName
  ) {
    setBusy(true);

    try {
      const {
        data,
        error
      } = await supabase
        .from('grocery_lists')
        .insert({
          family_id: family.id,
          created_by: user.id,
          name:
            newName ||
            `${list.name} - Refill`,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      const originals =
        groceryItems.filter(
          x => x.list_id === list.id
        );

      if (originals.length) {
        const records =
          originals.map(x => ({
            family_id: family.id,
            list_id: data.id,
            created_by: user.id,
            product_id:
              x.product_id,
            name: x.name,
            category: x.category,
            quantity: x.quantity,
            unit: x.unit,
            estimated_price:
              x.estimated_price,
            actual_price: null,
            is_done: false
          }));

        const result =
          await supabase
            .from('grocery_list_items')
            .insert(records);

        if (result.error) {
          throw result.error;
        }
      }

      setActiveListId(data.id);
      setGroceryTab('List');

      reload();
    } catch (e) {
      showError(
        'Copy list',
        e
      );
    } finally {
      setBusy(false);
    }
  }

  async function addMissingEssentials() {
    if (
      !activeList ||
      activeList.status !== 'active'
    ) {
      return;
    }

    const previous =
      groceryItems
        .filter(
          x =>
            x.family_id === family.id &&
            x.list_id !== activeList.id
        )
        .reduce(
          (map, x) => {
            const key =
              x.name.trim().toLowerCase();

            map[key] =
              (map[key] || 0) + 1;

            return map;
          },
          {}
        );

    const suggestions = [
      ...STARTER_PRODUCTS.map(
        ([name, category, unit]) => ({
          name,
          category,
          default_unit: unit,
          estimated_price: 0
        })
      ),
      ...groceryProducts
    ]
      .filter(
        (x, index, array) =>
          array.findIndex(
            y =>
              y.name.toLowerCase() ===
              x.name.toLowerCase()
          ) === index
      )
      .filter(
        x =>
          !activeItems.some(
            y =>
              y.name.toLowerCase() ===
              x.name.toLowerCase()
          )
      )
      .sort(
        (a, b) =>
          (
            previous[
              b.name.toLowerCase()
            ] || 0
          ) -
          (
            previous[
              a.name.toLowerCase()
            ] || 0
          )
      )
      .slice(0, 8);

    if (!suggestions.length) {
      return Alert.alert(
        'Essentials',
        'Your list already contains the suggested essentials.'
      );
    }

    Alert.alert(
      'Suggested essentials',
      `Add these to your list?\n\n${suggestions
        .map(x => '• ' + x.name)
        .join('\n')}`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add All',
          onPress: async () => {
            const records =
              suggestions.map(x => ({
                family_id: family.id,
                list_id: activeList.id,
                created_by: user.id,
                name: x.name,
                category: x.category,
                unit: x.default_unit,
                quantity: 1,
                estimated_price:
                  x.estimated_price || 0,
                is_done: false
              }));

            const { error } =
              await supabase
                .from('grocery_list_items')
                .insert(records);

            if (error) {
              showError(
                'Add essentials',
                error
              );
            } else {
              reload();
            }
          }
        }
      ]
    );
  }

  const catalogue = useMemo(() => {
    const customNames =
      new Set(
        groceryProducts.map(
          x =>
            x.name.trim().toLowerCase()
        )
      );

    const builtIn =
      STARTER_PRODUCTS
        .filter(
          ([name]) =>
            !customNames.has(
              name.toLowerCase()
            )
        )
        .map(
          ([name, category, unit]) => ({
            name,
            category,
            default_unit: unit,
            estimated_price: 0,
            is_favourite: false,
            id: null
          })
        );

    return [
      ...groceryProducts,
      ...builtIn
    ].sort(
      (a, b) =>
        a.name.localeCompare(b.name)
    );
  }, [groceryProducts]);

  // ==========================================================
  // GROCERY PRODUCT ROW
  // ==========================================================

  function groceryProductRow(
    product,
    key
  ) {
    return (
      <View
        key={key}
        style={s.groceryItem}
      >
        <Text
          style={{
            fontSize: 25,
            marginRight: 11
          }}
        >
          {CATEGORY_ICONS[
            product.category
          ] || '🛍️'}
        </Text>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              s.text,
              { fontWeight: '800' }
            ]}
          >
            {product.name}
          </Text>

          <Text style={s.small}>
            {product.category}
            {' · '}
            {product.default_unit ||
              product.unit ||
              'each'}
          </Text>

          <Text style={s.small}>
            Estimated unit price:
            {' '}
            {rand(
              product.estimated_price
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            toggleFavourite(product)
          }
          style={{ padding: 7 }}
        >
          <Text style={{ fontSize: 22 }}>
            {product.is_favourite
              ? '⭐'
              : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            openGroceryProduct(product)
          }
          style={{ padding: 8 }}
        >
          <Text
            style={{
              fontSize: 25,
              color: c.olive
            }}
          >
            ＋
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================================
  // GROCERY LIST SCREEN
  // ==========================================================

  function renderGroceryList() {
    return (
      <>
        <View style={s.card}>
          <Text style={s.section}>
            🧺 Active Shopping List
          </Text>

          <Choice
            c={c}
            s={s}
            label="Select grocery list"
            value={
              activeList
                ? activeList.name
                : 'No list selected'
            }
            options={groceryLists.map(
              x =>
                x.name +
                ' [' +
                x.status +
                ']'
            )}
            onChange={value => {
              const selected =
                groceryLists.find(
                  x =>
                    `${x.name} [${x.status}]` ===
                    value
                );

              if (selected) {
                setActiveListId(
                  selected.id
                );
              }
            }}
          />

          <Btn
            c={c}
            s={s}
            onPress={() => {
              setGroceryNewList(
                'Weekly Groceries'
              );

              setGroceryModal(
                'newList'
              );
            }}
          >
            ＋ Create New Shopping List
          </Btn>
        </View>

        {activeList ? (
          <>
            <View style={s.card}>
              <Text style={s.section}>
                {activeList.name}
              </Text>

              <Text style={s.muted}>
                Status:
                {' '}
                {activeList.status}
              </Text>

              <View style={s.between}>
                <View>
                  <Text style={s.small}>
                    Estimated basket
                  </Text>

                  <Text
                    style={[
                      s.section,
                      { marginTop: 5 }
                    ]}
                  >
                    {rand(
                      estimatedTotal
                    )}
                  </Text>
                </View>

                <View>
                  <Text style={s.small}>
                    Purchased so far
                  </Text>

                  <Text
                    style={[
                      s.section,
                      { marginTop: 5 }
                    ]}
                  >
                    {rand(
                      actualTotal
                    )}
                  </Text>
                </View>
              </View>

              <Text style={s.muted}>
                {activeItems.filter(
                  x => x.is_done
                ).length}
                {' of '}
                {activeItems.length}
                {' items ticked'}
              </Text>

              <View
                style={s.progressTrack}
              >
                <View
                  style={[
                    s.progressFill,
                    {
                      width: `${
                        activeItems.length
                          ? 100 *
                            activeItems.filter(
                              x => x.is_done
                            ).length /
                            activeItems.length
                          : 0
                      }%`
                    }
                  ]}
                />
              </View>

              {activeList.status ===
              'active' ? (
                <>
                  <Btn
                    c={c}
                    s={s}
                    onPress={() =>
                      openGroceryProduct()
                    }
                  >
                    ＋ Add Custom Grocery
                  </Btn>

                  <Btn
                    c={c}
                    s={s}
                    outline
                    onPress={
                      addMissingEssentials
                    }
                  >
                    ✨ Suggest Missing Essentials
                  </Btn>

                  <Btn
                    c={c}
                    s={s}
                    outline
                    onPress={() =>
                      setListStatus(
                        activeList,
                        'saved'
                      )
                    }
                  >
                    💾 Save List for Later
                  </Btn>

                  <Btn
                    c={c}
                    s={s}
                    onPress={
                      completeList
                    }
                  >
                    ✓ Finish Shopping
                  </Btn>
                </>
              ) : (
                <>
                  <Btn
                    c={c}
                    s={s}
                    onPress={() =>
                      duplicateList(
                        activeList
                      )
                    }
                  >
                    🔄 Use This List Again
                  </Btn>

                  {activeList.status ===
                    'saved' && (
                    <Btn
                      c={c}
                      s={s}
                      outline
                      onPress={() =>
                        setListStatus(
                          activeList,
                          'active'
                        )
                      }
                    >
                      Resume Shopping
                    </Btn>
                  )}
                </>
              )}
            </View>

            {CATEGORIES
              .filter(
                cat =>
                  activeItems.some(
                    x =>
                      x.category === cat
                  )
              )
              .map(cat => (
                <View key={cat}>
                  <Text style={s.section}>
                    {CATEGORY_ICONS[cat]}
                    {' '}
                    {cat}
                  </Text>

                  {activeItems
                    .filter(
                      x =>
                        x.category === cat
                    )
                    .map(item => (
                      <View
                        key={item.id}
                        style={
                          s.groceryItem
                        }
                      >
                        <TouchableOpacity
                          disabled={
                            activeList.status !==
                            'active'
                          }
                          onPress={() =>
                            toggleGroceryItem(
                              item
                            )
                          }
                          style={{
                            paddingRight: 12
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 25,
                              color: c.olive
                            }}
                          >
                            {item.is_done
                              ? '☑'
                              : '□'}
                          </Text>
                        </TouchableOpacity>

                        <View
                          style={{
                            flex: 1
                          }}
                        >
                          <Text
                            style={[
                              s.text,
                              {
                                fontWeight:
                                  '800',
                                textDecorationLine:
                                  item.is_done
                                    ? 'line-through'
                                    : 'none'
                              }
                            ]}
                          >
                            {item.name}
                          </Text>

                          <Text
                            style={
                              s.small
                            }
                          >
                            {item.quantity}
                            {' '}
                            {item.unit}
                            {' · '}
                            {rand(
                              Number(
                                item.quantity
                              ) *
                                Number(
                                  item.actual_price ??
                                    item.estimated_price
                                )
                            )}
                          </Text>
                        </View>

                        {activeList.status ===
                          'active' && (
                          <>
                            <TouchableOpacity
                              onPress={() =>
                                openGroceryProduct(
                                  null,
                                  item
                                )
                              }
                              style={{
                                padding: 7
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    c.cyan,
                                  fontSize:
                                    20
                                }}
                              >
                                ✎
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() =>
                                confirmDelete(
                                  'grocery_list_items',
                                  item
                                )
                              }
                              style={{
                                padding: 7
                              }}
                            >
                              <Text
                                style={{
                                  color:
                                    c.red,
                                  fontSize:
                                    24
                                }}
                              >
                                ×
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    ))}
                </View>
              ))}

            {!activeItems.length && (
              <Text style={s.muted}>
                Your list is empty.
                Add groceries from
                the catalogue or
                create a custom item.
              </Text>
            )}

            <Text style={s.muted}>
              Estimated cost still
              to buy:
              {' '}
              {rand(
                remainingEstimate
              )}
            </Text>
          </>
        ) : (
          <View style={s.card}>
            <Text style={s.muted}>
              Create your first
              grocery list to get
              started.
            </Text>
          </View>
        )}
      </>
    );
  }

  // ==========================================================
  // GROCERY CATALOGUE
  // ==========================================================

  function renderGroceryCatalogue(
    favouritesOnly = false
  ) {
    const filtered =
      catalogue.filter(x => {
        if (
          favouritesOnly &&
          !x.is_favourite
        ) {
          return false;
        }

        if (
          groceryCategory !== 'All' &&
          x.category !==
            groceryCategory
        ) {
          return false;
        }

        const q =
          grocerySearch
            .trim()
            .toLowerCase();

        return (
          !q ||
          x.name
            .toLowerCase()
            .includes(q) ||
          x.category
            .toLowerCase()
            .includes(q)
        );
      });

    return (
      <>
        <View style={s.card}>
          <Field
            c={c}
            s={s}
            label="Search groceries"
            value={
              grocerySearch
            }
            onChange={
              setGrocerySearch
            }
            placeholder="Search milk, bread, chicken..."
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
          >
            {[
              'All',
              ...CATEGORIES
            ].map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() =>
                  setGroceryCategory(
                    cat
                  )
                }
                style={[
                  s.chip,
                  groceryCategory ===
                    cat && {
                    backgroundColor:
                      c.olive
                  }
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    groceryCategory ===
                      cat && {
                      color:
                        '#FFFFFF'
                    }
                  ]}
                >
                  {cat === 'All'
                    ? 'All'
                    : CATEGORY_ICONS[
                        cat
                      ] +
                      ' ' +
                      cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {!favouritesOnly && (
            <Btn
              c={c}
              s={s}
              onPress={() => {
                setGroceryName('');
                setGroceryCategory(
                  'Other'
                );
                setGroceryUnit(
                  'each'
                );
                setGroceryPrice(
                  '0'
                );
                setGroceryFavourite(
                  false
                );
                setGroceryProductId(
                  null
                );
                setGroceryModal(
                  'catalogue'
                );
              }}
            >
              ＋ Create Custom Product
            </Btn>
          )}
        </View>

        <Text style={s.section}>
          {favouritesOnly
            ? '⭐ Favourite Products'
            : '🛍️ Grocery Catalogue'}
          {' ('}
          {filtered.length}
          {')'}
        </Text>

        {filtered.map(
          (product, i) =>
            groceryProductRow(
              product,
              product.id ||
                `starter-${i}`
            )
        )}

        {!filtered.length && (
          <Text style={s.muted}>
            No matching groceries
            found.
          </Text>
        )}
      </>
    );
  }

  // ==========================================================
  // GROCERY BUDGET
  // ==========================================================

  function renderGroceryBudget() {
    const remaining =
      budget -
      spentIncludingCurrent;

    return (
      <>
        <View style={s.card}>
          <Text style={s.section}>
            💰 Monthly Grocery Budget
          </Text>

          <Text style={s.small}>
            Budget for
            {' '}
            {new Date().toLocaleDateString(
              'en-ZA',
              {
                month: 'long',
                year: 'numeric'
              }
            )}
          </Text>

          <Text
            style={[
              s.title,
              { marginTop: 9 }
            ]}
          >
            {rand(budget)}
          </Text>

          <Field
            c={c}
            s={s}
            label="Monthly grocery budget (R)"
            value={
              groceryBudgetInput
            }
            onChange={
              setGroceryBudgetInput
            }
            numeric
          />

          <Btn
            c={c}
            s={s}
            disabled={busy}
            onPress={
              saveGroceryBudget
            }
          >
            Save Monthly Budget
          </Btn>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            📊 Spending Overview
          </Text>

          {[
            [
              'Completed shopping trips this month',
              rand(monthSpend)
            ],
            [
              'Current trip purchases',
              rand(
                activeList?.status ===
                  'active'
                  ? actualTotal
                  : 0
              )
            ],
            [
              'Total recorded spending',
              rand(
                spentIncludingCurrent
              )
            ],
            [
              'Remaining budget',
              rand(remaining)
            ],
            [
              'Still estimated to buy',
              rand(
                activeList?.status ===
                  'active'
                  ? remainingEstimate
                  : 0
              )
            ]
          ].map(
            ([label, value]) => (
              <View
                key={label}
                style={[
                  s.between,
                  s.divider
                ]}
              >
                <Text
                  style={[
                    s.muted,
                    { flex: 1 }
                  ]}
                >
                  {label}
                </Text>

                <Text
                  style={[
                    s.text,
                    {
                      fontWeight:
                        '900'
                    }
                  ]}
                >
                  {value}
                </Text>
              </View>
            )
          )}

          <View
            style={
              s.progressTrack
            }
          >
            <View
              style={[
                s.progressFill,
                {
                  width: `${
                    budget > 0
                      ? Math.min(
                          100,
                          spentIncludingCurrent /
                            budget *
                            100
                        )
                      : 0
                  }%`,
                  backgroundColor:
                    budget > 0 &&
                    spentIncludingCurrent >
                      budget
                      ? c.red
                      : c.olive
                }
              ]}
            />
          </View>

          {budget > 0 &&
            spentIncludingCurrent >
              budget && (
              <Text
                style={[
                  s.muted,
                  {
                    color: c.red,
                    marginTop: 10
                  }
                ]}
              >
                Your recorded grocery
                spending exceeds
                the monthly budget.
              </Text>
            )}
        </View>

        <Text style={s.muted}>
          Prices are entered by your
          family. FamSpace does not
          currently fetch live
          Checkers or Pick n Pay
          prices.
        </Text>
      </>
    );
  }

  // ==========================================================
  // SHOPPING HISTORY
  // ==========================================================

  function renderGroceryHistory() {
    const history = [
      ...completedLists
    ].sort(
      (a, b) =>
        String(
          b.completed_at || ''
        ).localeCompare(
          String(
            a.completed_at || ''
          )
        )
    );

    return (
      <>
        <Text style={s.section}>
          🧾 Completed Shopping Trips
        </Text>

        {!history.length && (
          <Text style={s.muted}>
            Your completed shopping
            trips will appear here.
          </Text>
        )}

        {history.map(list => {
          const items =
            groceryItems.filter(
              x =>
                x.list_id ===
                list.id
            );

          const total =
            items
              .filter(
                x => x.is_done
              )
              .reduce(
                (sum, x) =>
                  sum +
                  Number(
                    x.quantity
                  ) *
                  Number(
                    x.actual_price ??
                      x.estimated_price ??
                      0
                  ),
                0
              );

          return (
            <View
              key={list.id}
              style={s.card}
            >
              <Text
                style={
                  s.section
                }
              >
                {list.name}
              </Text>

              <Text
                style={
                  s.muted
                }
              >
                Completed:
                {' '}
                {String(
                  list.completed_at ||
                    ''
                ).slice(0, 10)}
              </Text>

              <Text
                style={[
                  s.title,
                  {
                    marginTop: 8
                  }
                ]}
              >
                {rand(total)}
              </Text>

              <Text
                style={
                  s.small
                }
              >
                {items.filter(
                  x => x.is_done
                ).length}
                {' items purchased'}
              </Text>

              <Btn
                c={c}
                s={s}
                onPress={() =>
                  duplicateList(
                    list
                  )
                }
              >
                🔄 Shop This List Again
              </Btn>

              <Btn
                c={c}
                s={s}
                outline
                onPress={() => {
                  setActiveListId(
                    list.id
                  );
                  setGroceryTab(
                    'List'
                  );
                }}
              >
                View Items
              </Btn>
            </View>
          );
        })}
      </>
    );
  }

  // ==========================================================
  // SAVED LISTS
  // ==========================================================

  function renderSavedLists() {
    const saved =
      groceryLists.filter(
        x =>
          x.status === 'saved' ||
          x.status === 'active'
      );

    return (
      <>
        <Text style={s.section}>
          💾 Saved & Active Lists
        </Text>

        {!saved.length && (
          <Text style={s.muted}>
            No saved lists yet.
          </Text>
        )}

        {saved.map(list => (
          <View
            key={list.id}
            style={s.card}
          >
            <Text style={s.section}>
              {list.name}
            </Text>

            <Text style={s.muted}>
              {list.status}
              {' · '}
              {groceryItems.filter(
                x =>
                  x.list_id ===
                  list.id
              ).length}
              {' items'}
            </Text>

            <Btn
              c={c}
              s={s}
              onPress={() => {
                setActiveListId(
                  list.id
                );
                setGroceryTab(
                  'List'
                );
              }}
            >
              Open List
            </Btn>

            <Btn
              c={c}
              s={s}
              outline
              onPress={() =>
                duplicateList(
                  list
                )
              }
            >
              Duplicate List
            </Btn>
          </View>
        ))}
      </>
    );
  }

  // ==========================================================
  // GROCERY MODAL
  // ==========================================================

  function renderGroceryModal() {
    if (!groceryModal) {
      return null;
    }

    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() =>
          setGroceryModal('')
        }
      >
        <View
          style={
            s.modalShade
          }
        >
          <View
            style={
              s.modalBox
            }
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
            >
              <Text
                style={
                  s.section
                }
              >
                {groceryModal ===
                'newList'
                  ? 'Create Shopping List'
                  : groceryModal ===
                    'catalogue'
                  ? 'Custom Grocery Product'
                  : groceryModal ===
                    'editItem'
                  ? 'Edit Grocery Item'
                  : 'Add Grocery Item'}
              </Text>

              {groceryModal ===
              'newList' ? (
                <>
                  <Field
                    c={c}
                    s={s}
                    label="List name"
                    value={
                      groceryNewList
                    }
                    onChange={
                      setGroceryNewList
                    }
                  />

                  <Btn
                    c={c}
                    s={s}
                    disabled={
                      busy
                    }
                    onPress={
                      createGroceryList
                    }
                  >
                    Create List
                  </Btn>
                </>
              ) : (
                <>
                  <Field
                    c={c}
                    s={s}
                    label="Product name"
                    value={
                      groceryName
                    }
                    onChange={
                      setGroceryName
                    }
                  />

                  <Choice
                    c={c}
                    s={s}
                    label="Category"
                    value={
                      groceryCategory
                    }
                    options={
                      CATEGORIES
                    }
                    onChange={
                      setGroceryCategory
                    }
                  />

                  <Choice
                    c={c}
                    s={s}
                    label="Unit"
                    value={
                      groceryUnit
                    }
                    options={[
                      'each',
                      'pack',
                      'kg',
                      'g',
                      'L',
                      'ml',
                      'loaf',
                      'bottle',
                      'bag',
                      'box',
                      'tin',
                      'dozen'
                    ]}
                    onChange={
                      setGroceryUnit
                    }
                  />

                  {groceryModal !==
                    'catalogue' && (
                    <Field
                      c={c}
                      s={s}
                      label="Quantity"
                      value={
                        groceryQty
                      }
                      onChange={
                        setGroceryQty
                      }
                      numeric
                    />
                  )}

                  <Field
                    c={c}
                    s={s}
                    label="Estimated price per unit (R)"
                    value={
                      groceryPrice
                    }
                    onChange={
                      setGroceryPrice
                    }
                    numeric
                  />

                  {groceryModal ===
                    'editItem' && (
                    <Field
                      c={c}
                      s={s}
                      label="Actual price per unit (R, optional)"
                      value={
                        groceryActual
                      }
                      onChange={
                        setGroceryActual
                      }
                      numeric
                    />
                  )}

                  {groceryModal ===
                    'catalogue' && (
                    <Btn
                      c={c}
                      s={s}
                      outline
                      onPress={() =>
                        setGroceryFavourite(
                          !groceryFavourite
                        )
                      }
                    >
                      {groceryFavourite
                        ? '⭐ Favourite selected'
                        : '☆ Mark as favourite'}
                    </Btn>
                  )}

                  <Btn
                    c={c}
                    s={s}
                    disabled={
                      busy
                    }
                    onPress={
                      groceryModal ===
                      'catalogue'
                        ? saveCatalogueProduct
                        : saveGroceryItem
                    }
                  >
                    {busy
                      ? 'Saving...'
                      : 'Save'}
                  </Btn>
                </>
              )}

              <Btn
                c={c}
                s={s}
                outline
                onPress={() =>
                  setGroceryModal(
                    ''
                  )
                }
              >
                Cancel
              </Btn>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // ==========================================================
  // GROCERY HUB
  // ==========================================================

  function renderGroceries() {
    const sections = [
      ['List', '🛒'],
      ['Catalogue', '🛍️'],
      ['Favourites', '⭐'],
      ['Budget', '💰'],
      ['Saved', '💾'],
      ['History', '🧾']
    ];

    return (
      <>
        <View style={s.hero}>
          <Text style={s.eyebrow}>
            YOUR FAMILY GROCERIES
          </Text>

          <Text style={s.heroTitle}>
            🛒 Grocery Hub
          </Text>

          <Text style={s.heroSub}>
            Plan together.
            Shop smarter.
            Stay on budget.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{
            marginBottom: 14
          }}
        >
          {sections.map(
            ([key, icon]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setGroceryTab(
                    key
                  );
                  setGroceryCategory(
                    'All'
                  );
                  setGrocerySearch(
                    ''
                  );
                }}
                style={[
                  s.chip,
                  groceryTab ===
                    key && {
                    backgroundColor:
                      c.olive
                  }
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    groceryTab ===
                      key && {
                      color:
                        '#FFFFFF'
                    }
                  ]}
                >
                  {icon}
                  {' '}
                  {key}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {groceryLoading && (
          <ActivityIndicator
            color={c.olive}
          />
        )}

        {groceryTab ===
          'List' &&
          renderGroceryList()}

        {groceryTab ===
          'Catalogue' &&
          renderGroceryCatalogue()}

        {groceryTab ===
          'Favourites' &&
          renderGroceryCatalogue(
            true
          )}

        {groceryTab ===
          'Budget' &&
          renderGroceryBudget()}

        {groceryTab ===
          'Saved' &&
          renderSavedLists()}

        {groceryTab ===
          'History' &&
          renderGroceryHistory()}

        {renderGroceryModal()}
      </>
    );
  }

  // ==========================================================
  // STANDARD MODULES
  // ==========================================================

  function renderModule() {
    const config =
      MODULES[tab];

    const visible =
      tab === 'Calendar'
        ? rows.filter(
            x =>
              x.event_date ===
              selectedDate
          )
        : rows;

    const balance =
      rows.reduce(
        (sum, x) =>
          sum +
          (
            String(
              x.category
            ).toLowerCase() ===
            'income'
              ? 1
              : -1
          ) *
            Number(
              x.amount || 0
            ),
        0
      );

    return (
      <>
        <Text style={s.title}>
          {config.icon}
          {' '}
          {config.label}
        </Text>

        {tab ===
          'Calendar' && (
          <View style={s.card}>
            <Calendar
              c={c}
              s={s}
              value={
                selectedDate
              }
              onChange={v => {
                setSelectedDate(
                  v
                );
                setDate(v);
              }}
              events={rows}
            />
          </View>
        )}

        <View style={s.card}>
          <Text style={s.section}>
            Add
            {' '}
            {tab === 'Calendar'
              ? 'Event'
              : tab === 'Dinner'
              ? 'Dinner'
              : tab === 'Tasks'
              ? 'Task'
              : 'Entry'}
          </Text>

          <Field
            c={c}
            s={s}
            label={
              tab === 'Dinner'
                ? 'Meal'
                : tab === 'Budget'
                ? 'Description'
                : 'Title'
            }
            value={title}
            onChange={
              setTitle
            }
          />

          {config.date && (
            <DateChoice
              c={c}
              s={s}
              value={date}
              onChange={
                setDate
              }
            />
          )}

          {tab ===
            'Budget' && (
            <>
              <Choice
                c={c}
                s={s}
                label="Entry type"
                value={
                  entryType
                }
                options={[
                  'Expense',
                  'Income'
                ]}
                onChange={
                  setEntryType
                }
              />

              {entryType ===
                'Expense' && (
                <Choice
                  c={c}
                  s={s}
                  label="Category"
                  value={
                    category
                  }
                  options={[
                    'Groceries',
                    'Rent',
                    'Water',
                    'Electricity',
                    'Rates and Taxes',
                    'Levies',
                    'Transport',
                    'Fuel',
                    'Insurance',
                    'Medical',
                    'Entertainment',
                    'Dining',
                    'Savings',
                    'Other'
                  ]}
                  onChange={
                    setCategory
                  }
                />
              )}

              <Field
                c={c}
                s={s}
                label="Amount (R)"
                value={
                  amount
                }
                onChange={
                  setAmount
                }
                numeric
              />
            </>
          )}

          {tab ===
            'Tasks' && (
            <Choice
              c={c}
              s={s}
              label="Priority"
              value={
                priority
              }
              options={[
                'Low',
                'Normal',
                'High',
                'Urgent'
              ]}
              onChange={
                setPriority
              }
            />
          )}

          {[
            'Calendar',
            'Dinner',
            'Tasks'
          ].includes(tab) && (
            <Field
              c={c}
              s={s}
              label="Notes (optional)"
              value={
                notes
              }
              onChange={
                setNotes
              }
              multiline
            />
          )}

          <Btn
            c={c}
            s={s}
            disabled={
              busy
            }
            onPress={
              addModuleItem
            }
          >
            Save
          </Btn>
        </View>

        {tab ===
          'Budget' && (
          <View style={s.card}>
            <Text style={s.section}>
              💰 Recorded Balance
            </Text>

            <Text style={s.title}>
              {rand(
                balance
              )}
            </Text>
          </View>
        )}

        <View
          style={[
            s.between,
            {
              marginBottom:
                12
            }
          ]}
        >
          <Text style={s.section}>
            {tab ===
              'Calendar'
              ? 'Events on Selected Date'
              : 'Family Items'}
          </Text>

          <TouchableOpacity
            onPress={
              reload
            }
          >
            <Text
              style={{
                color:
                  c.cyan
              }}
            >
              Refresh ↻
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            color={
              c.olive
            }
          />
        )}

        {!loading &&
          !visible.length && (
          <Text style={s.muted}>
            Nothing here yet.
          </Text>
        )}

        {visible.map(
          item => (
            <View
              key={
                item.id
              }
              style={
                s.groceryItem
              }
            >
              {tab ===
                'Tasks' && (
                <TouchableOpacity
                  onPress={() =>
                    toggleTask(
                      item
                    )
                  }
                  style={{
                    paddingRight:
                      12
                  }}
                >
                  <Text
                    style={{
                      fontSize:
                        25,
                      color:
                        c.olive
                    }}
                  >
                    {item.is_done
                      ? '☑'
                      : '□'}
                  </Text>
                </TouchableOpacity>
              )}

              <View
                style={{
                  flex: 1
                }}
              >
                <Text
                  style={[
                    s.text,
                    {
                      fontWeight:
                        '800'
                    }
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    s.small
                  }
                >
                  {[
                    config.date
                      ? item[
                          config.date
                        ]
                      : null,

                    tab ===
                    'Budget'
                      ? `${item.category} · ${rand(
                          item.amount
                        )}`
                      : null,

                    tab ===
                    'Tasks'
                      ? item.priority
                      : null,

                    item.notes
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      ' · '
                    )}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  confirmDelete(
                    config.table,
                    item
                  )
                }
                style={{
                  padding:
                    8
                }}
              >
                <Text
                  style={{
                    color:
                      c.red,
                    fontSize:
                      25
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </>
    );
  }

  // ==========================================================
  // HOME DASHBOARD
  // ==========================================================

  function renderHome() {
    const events =
      dashboard.Calendar
        .filter(
          x =>
            x.event_date >=
            today()
        )
        .sort(
          (a, b) =>
            a.event_date.localeCompare(
              b.event_date
            )
        );

    const tasks =
      dashboard.Tasks.filter(
        x =>
          !x.is_done
      );

    const dinner =
      dashboard.Dinner.find(
        x =>
          x.dinner_date ===
          today()
      );

    const balance =
      dashboard.Budget.reduce(
        (sum, x) =>
          sum +
          (
            String(
              x.category
            ).toLowerCase() ===
            'income'
              ? 1
              : -1
          ) *
            Number(
              x.amount || 0
            ),
        0
      );

    const stats = [
      [
        'Calendar',
        '📅',
        events.length,
        'Upcoming events'
      ],
      [
        'Shopping',
        '🛒',
        groceryItems.filter(
          x =>
            x.list_id ===
              activeListId &&
            !x.is_done
        ).length,
        'Groceries to buy'
      ],
      [
        'Budget',
        '💰',
        rand(balance),
        'Recorded balance'
      ],
      [
        'Dinner',
        '🍽️',
        dinner?.title ||
          'Not planned',
        "Tonight's dinner"
      ],
      [
        'Tasks',
        '✅',
        tasks.length,
        'Outstanding tasks'
      ]
    ];

    return (
      <>
        {/* COMPACT WELCOME SECTION */}

        <View style={s.hero}>
          <Text style={s.eyebrow}>
            YOUR FAMILY SPACE
          </Text>

          <Text style={s.heroTitle}>
            Welcome home.
          </Text>

          <Text style={s.heroSub}>
            Everything your family
            needs, together.
          </Text>
        </View>

        {/* OVERVIEW */}

        <View style={s.between}>
          <Text style={s.title}>
            Overview
          </Text>

          <TouchableOpacity
            onPress={reload}
          >
            <Text
              style={{
                color: c.cyan,
                fontWeight: '800'
              }}
            >
              Refresh ↻
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            s.between,
            {
              flexWrap:
                'wrap'
            }
          ]}
        >
          {stats.map(
            ([
              key,
              icon,
              value,
              subtitle
            ]) => (
              <TouchableOpacity
                key={key}
                style={s.stat}
                onPress={() =>
                  navigate(key)
                }
              >
                <Text
                  style={{
                    fontSize:
                      28
                  }}
                >
                  {icon}
                </Text>

                <Text
                  style={
                    s.small
                  }
                >
                  {key ===
                  'Shopping'
                    ? 'Groceries'
                    : MODULES[
                        key
                      ].label}
                </Text>

                <Text
                  style={
                    s.statValue
                  }
                  numberOfLines={
                    2
                  }
                >
                  {value}
                </Text>

                <Text
                  style={
                    s.small
                  }
                >
                  {subtitle}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* FAMILY CARD */}

        <TouchableOpacity
          style={s.card}
          onPress={() =>
            navigate(
              'Family'
            )
          }
        >
          <Text style={s.section}>
            👨‍👩‍👧‍👦 {family.name}
          </Text>

          <Text style={s.small}>
            {members.length}
            {' family members · Manage family'}
          </Text>
        </TouchableOpacity>

        {/* UPCOMING */}

        <Text style={s.title}>
          Coming up
        </Text>

        {[
          [
            '📅 Next Family Events',
            events
              .slice(
                0,
                3
              )
              .map(
                x =>
                  `${x.event_date} · ${x.title}`
              ),
            'Calendar'
          ],
          [
            "🍽️ Tonight's Dinner",
            [
              dinner?.title ||
                'Nothing planned yet'
            ],
            'Dinner'
          ],
          [
            '🛒 Grocery Reminders',
            groceryItems
              .filter(
                x =>
                  x.list_id ===
                    activeListId &&
                  !x.is_done
              )
              .slice(
                0,
                4
              )
              .map(
                x => x.name
              ),
            'Shopping'
          ],
          [
            '✅ Outstanding Tasks',
            tasks
              .slice(
                0,
                4
              )
              .map(
                x => x.title
              ),
            'Tasks'
          ]
        ].map(
          ([
            heading,
            lines,
            destination
          ]) => (
            <TouchableOpacity
              key={
                heading
              }
              style={
                s.card
              }
              onPress={() =>
                navigate(
                  destination
                )
              }
            >
              <Text
                style={
                  s.section
                }
              >
                {heading}
              </Text>

              {lines.length
                ? lines.map(
                    (
                      line,
                      i
                    ) => (
                      <Text
                        key={
                          i
                        }
                        style={[
                          s.text,
                          {
                            marginBottom:
                              7
                          }
                        ]}
                      >
                        {line}
                      </Text>
                    )
                  )
                : (
                  <Text
                    style={
                      s.muted
                    }
                  >
                    Nothing coming up.
                  </Text>
                )}
            </TouchableOpacity>
          )
        )}
      </>
    );
  }

  // ==========================================================
  // FAMILY SCREEN
  // ==========================================================

  function renderFamily() {
    return (
      <>
        <View style={s.hero}>
          <Text style={s.eyebrow}>
            YOUR PRIVATE FAMILY
          </Text>

          <Text style={s.heroTitle}>
            👨‍👩‍👧‍👦 {family.name}
          </Text>

          <Text style={s.heroSub}>
            {members.length}
            {' family members'}
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            🔑 Family Invite Code
          </Text>

          <Text style={s.muted}>
            Only people with
            your invite code
            can join this family.
          </Text>

          <Text
            selectable
            style={
              s.invite
            }
          >
            {family.invite_code ||
              'Unavailable'}
          </Text>

          <Btn
            c={c}
            s={s}
            onPress={async () => {
              try {
                await Share.share({
                  message:
                    `Join our family "${family.name}" on FamSpace!\nInvite code: ${family.invite_code}`
                });
              } catch (e) {
                showError(
                  'Share invitation',
                  e
                );
              }
            }}
          >
            ↗ Share Invite Code
          </Btn>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            👥 Family Members
          </Text>

          {members.map(
            member => (
              <View
                key={
                  member.id
                }
                style={
                  s.divider
                }
              >
                <Text
                  style={
                    s.text
                  }
                >
                  {member.display_name ||
                    (
                      member.user_id ===
                      user.id
                        ? 'You'
                        : 'Family Member'
                    )}

                  {member.user_id ===
                    user.id
                    ? ' (You)'
                    : ''}
                </Text>

                <Text
                  style={
                    s.small
                  }
                >
                  {member.role ===
                    'admin' ||
                  member.user_id ===
                    family.created_by
                    ? '👑 Admin'
                    : 'Family Member'}
                </Text>
              </View>
            )
          )}
        </View>

        {families.length >
          1 && (
          <View style={s.card}>
            <Text style={s.section}>
              Switch Family
            </Text>

            {families.map(
              x => (
                <Btn
                  key={
                    x.id
                  }
                  c={c}
                  s={s}
                  outline
                  onPress={() => {
                    setFamily(
                      x
                    );
                    navigate(
                      'Home'
                    );
                  }}
                >
                  {x.id ===
                    family.id
                    ? '✓ '
                    : ''}
                  {x.name}
                </Btn>
              )
            )}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.section}>
            Account
          </Text>

          <Text style={s.muted}>
            {user.email}
          </Text>

          <Btn
            c={c}
            s={s}
            outline
            onPress={
              logout
            }
          >
            Sign Out
          </Btn>
        </View>
      </>
    );
  }

  // ==========================================================
  // SETTINGS
  // ==========================================================

  function renderSettings() {
    return (
      <>
        <View style={s.hero}>
          <Text style={s.eyebrow}>
            PERSONALISE YOUR SPACE
          </Text>

          <Text style={s.heroTitle}>
            ⚙️ Settings
          </Text>

          <Text style={s.heroSub}>
            Make FamSpace feel
            right for you.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            🎨 App Appearance
          </Text>

          {[
            [
              'system',
              '📱',
              'System Default',
              'Follow your phone appearance'
            ],
            [
              'light',
              '☀️',
              'Light Mode',
              'Cream, navy and olive'
            ],
            [
              'dark',
              '🌙',
              'Dark Mode',
              'Deep navy and light text'
            ]
          ].map(
            ([
              key,
              icon,
              name,
              description
            ]) => (
              <TouchableOpacity
                key={key}
                onPress={() =>
                  changeTheme(
                    key
                  )
                }
                style={[
                  s.groceryItem,
                  theme ===
                    key && {
                    borderColor:
                      c.olive,
                    borderWidth:
                      2
                  }
                ]}
              >
                <Text
                  style={{
                    fontSize:
                      27,
                    marginRight:
                      12
                  }}
                >
                  {icon}
                </Text>

                <View
                  style={{
                    flex: 1
                  }}
                >
                  <Text
                    style={[
                      s.text,
                      {
                        fontWeight:
                          '800'
                      }
                    ]}
                  >
                    {name}
                  </Text>

                  <Text
                    style={
                      s.small
                    }
                  >
                    {description}
                  </Text>
                </View>

                <Text
                  style={{
                    color:
                      c.olive,
                    fontSize:
                      22
                  }}
                >
                  {theme ===
                    key
                    ? '◉'
                    : '○'}
                </Text>
              </TouchableOpacity>
            )
          )}

          <Text style={s.muted}>
            Current appearance:
            {' '}
            {effective ===
              'dark'
              ? 'Dark'
              : 'Light'}
          </Text>

          <Text style={s.small}>
            Theme preference is
            saved on this device.
          </Text>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            👨‍👩‍👧‍👦 Family
          </Text>

          <Text style={s.muted}>
            {family.name}
            {' · '}
            {members.length}
            {' members'}
          </Text>

          <Btn
            c={c}
            s={s}
            outline
            onPress={() =>
              navigate(
                'Family'
              )
            }
          >
            Manage Family
          </Btn>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            🔐 Account
          </Text>

          <Text style={s.muted}>
            {user.email}
          </Text>

          <Btn
            c={c}
            s={s}
            outline
            onPress={
              logout
            }
          >
            Sign Out
          </Btn>
        </View>
      </>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    !themeReady ||
    !authReady
  ) {
    return (
      <View style={s.center}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={
            c.header
          }
        />

        <Text
          style={{
            color:
              c.text,
            fontSize:
              32,
            fontWeight:
              '900'
          }}
        >
          FamSpace
        </Text>

        <Text style={s.muted}>
          Your family.
          One space.
        </Text>

        <ActivityIndicator
          color={c.olive}
          size="large"
          style={{
            marginTop:
              20
          }}
        />
      </View>
    );
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  if (!user) {
    return (
      <KeyboardAvoidingView
        style={s.root}
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent:
              'center',
            padding: 24
          }}
        >
          <View
            style={{
              alignItems:
                'center',
              marginBottom:
                28
            }}
          >
            <Text
              style={{
                color:
                  c.text,
                fontSize:
                  34,
                fontWeight:
                  '900'
              }}
            >
              FamSpace
            </Text>

            <Text style={s.muted}>
              Your family.
              One space.
            </Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>
              {register
                ? 'Create your account'
                : 'Welcome back'}
            </Text>

            <Field
              c={c}
              s={s}
              label="Email address"
              value={
                email
              }
              onChange={
                setEmail
              }
            />

            <Field
              c={c}
              s={s}
              label="Password"
              value={
                password
              }
              onChange={
                setPassword
              }
              secure
            />

            <Btn
              c={c}
              s={s}
              disabled={
                busy
              }
              onPress={
                authenticate
              }
            >
              {busy
                ? 'Please wait...'
                : register
                ? 'Create Account'
                : 'Sign In'}
            </Btn>

            <Btn
              c={c}
              s={s}
              outline
              onPress={() =>
                setRegister(
                  !register
                )
              }
            >
              {register
                ? 'Already registered? Sign in'
                : 'New here? Sign up'}
            </Btn>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================================================
  // FAMILY ONBOARDING
  // ==========================================================

  if (!family) {
    return (
      <ScrollView
        style={s.root}
        contentContainerStyle={
          s.content
        }
      >
        <View
          style={{
            alignItems:
              'center',
            marginVertical:
              22
          }}
        >
          <Text
            style={{
              color:
                c.text,
              fontSize:
                30,
              fontWeight:
                '900'
            }}
          >
            FamSpace
          </Text>
        </View>

        <Text style={s.title}>
          Your Family Space
        </Text>

        <View style={s.card}>
          <Text style={s.section}>
            🏠 Create a Family
          </Text>

          <Field
            c={c}
            s={s}
            label="Family name"
            value={
              familyName
            }
            onChange={
              setFamilyName
            }
          />

          <Btn
            c={c}
            s={s}
            disabled={
              busy
            }
            onPress={() =>
              familyAction(
                'create'
              )
            }
          >
            Create Family
          </Btn>
        </View>

        <View style={s.card}>
          <Text style={s.section}>
            🔑 Join a Family
          </Text>

          <Field
            c={c}
            s={s}
            label="Family invite code"
            value={
              inviteCode
            }
            onChange={
              setInviteCode
            }
          />

          <Btn
            c={c}
            s={s}
            disabled={
              busy
            }
            onPress={() =>
              familyAction(
                'join'
              )
            }
          >
            Join Family
          </Btn>
        </View>

        <Btn
          c={c}
          s={s}
          outline
          onPress={
            reload
          }
        >
          Refresh Families
        </Btn>

        <Btn
          c={c}
          s={s}
          outline
          onPress={
            logout
          }
        >
          Sign Out
        </Btn>
      </ScrollView>
    );
  }

  // ==========================================================
  // MAIN APPLICATION LAYOUT
  // ==========================================================

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          c.header
        }
      />

      {/* HEADER: FAMSPACE TEXT ONLY */}

      <View style={s.header}>
        <View
          style={{
            flex: 1
          }}
        >
          <Text
            style={
              s.headerTitle
            }
          >
            FamSpace
          </Text>

          <Text
            style={
              s.headerSub
            }
            numberOfLines={
              1
            }
          >
            {family.name}
          </Text>
        </View>

        <TouchableOpacity
          style={
            s.iconButton
          }
          onPress={() =>
            navigate(
              'Settings'
            )
          }
        >
          <Text
            style={{
              fontSize:
                23
            }}
          >
            ⚙️
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            s.iconButton
          }
          onPress={() =>
            navigate(
              'Family'
            )
          }
        >
          <Text
            style={{
              fontSize:
                22
            }}
          >
            👨‍👩‍👧‍👦
          </Text>
        </TouchableOpacity>
      </View>

      {/* NAVIGATION */}

      <ScrollView
        horizontal
        style={s.nav}
        showsHorizontalScrollIndicator={
          false
        }
        contentContainerStyle={{
          alignItems:
            'center',
          paddingHorizontal:
            8
        }}
      >
        {NAV.map(
          ([
            key,
            icon,
            label
          ]) => (
            <TouchableOpacity
              key={
                key
              }
              onPress={() =>
                navigate(
                  key
                )
              }
              style={[
                s.navItem,
                tab ===
                  key && {
                  backgroundColor:
                    c.olive
                }
              ]}
            >
              <Text
                style={{
                  fontSize:
                    23,
                  marginRight:
                    8
                }}
              >
                {icon}
              </Text>

              <Text
                style={[
                  s.navText,
                  tab ===
                    key && {
                    color:
                      '#FFFFFF'
                  }
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {/* PAGE CONTENT */}

      <ScrollView
        style={{
          flex: 1
        }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          s.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              false
            }
            onRefresh={
              reload
            }
            tintColor={
              c.olive
            }
            colors={[
              c.olive
            ]}
          />
        }
      >
        {tab ===
        'Home'
          ? renderHome()
          : tab ===
            'Shopping'
          ? renderGroceries()
          : tab ===
            'Family'
          ? renderFamily()
          : tab ===
            'Settings'
          ? renderSettings()
          : renderModule()}
      </ScrollView>
    </View>
  );
}
