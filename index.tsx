import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState,
  ViewStyle,
  AppStateStatus,
  TextStyle
} from "react-native";
import { sprintf } from "sprintf-js";
import styles from "./styles";

interface CountDownTimerProps {
  /**
   * Counter id, to determine whether to reset the counter or not
   * - `default` null
   */
  id?: string | null;

  /**
   * Override the component style
   * - `default` {}
   */
  style?: ViewStyle;

  /**
   *  Digit style
   * - `default`: {backgroundColor: '#FAB913'}
   */
  digitStyle?: ViewStyle;

  /**
   * Digit Text style
   * - `default`: {color: #FAB913 '#000'}
   */
  digitTxtStyle?: TextStyle;

  /**
   * Time Label style
   * - `default`: {color: #FAB913 '#000'}
   */
  timeLabelStyle?: TextStyle;

  /**
   * Separator style
   * - `default`: {color: #FAB913 '#000'}
   */
  separatorStyle?: TextStyle;

  /**
   * Size of the countdown component
   * - `default`: 15
   */
  size?: number;

  /**
   * Number of seconds to countdown
   * - `default`: 0
   */
  until?: number;

  /**
   * What function should be invoked when the time is 0
   * - `default`: null
   */
  onFinish?: () => void;

  /**
   * What function should be invoked when the timer is changing
   * - `default`: null
   */
  onChange?: (value?: number) => void;

  /**
   * What function should be invoked when clicking on the timer
   * - `default`: null
   */
  onPress?: () => void;

  /**
   * What Digits to show
   * - `default`: ['D', 'H', 'M', 'S']
   */
  timeToShow?: Array<"D" | "H" | "M" | "S">;

  /**
   * Text to show in time label
   * - `default`: {d: 'Days', h: 'Hours', m: 'Minutes', s: 'Seconds'}
   */
  timeLabels?: { d?: string; h?: string; m?: string; s?: string };

  /**
   * Should show separator
   * - `default`: false
   */
  showSeparator?: boolean;

  /**
   * A boolean to pause and resume the component
   * - `default`: true
   */
  running?: boolean;
}

const CountdownTimer = (props: CountDownTimerProps) => {
  const [until, useUntil] = useState(Math.max(props.until!, 0) as number);
  const [lastUntil, useLastUntil] = useState(null as number | null);
  const [wentBackgroundAt, useWentBackgroundAt] = useState(
    null as number | null
  );
  useEffect(() => {
    const timer = setInterval(updateTimer, 1000);
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      clearInterval(timer);
      useLastUntil(until), useUntil(Math.max(props.until!, 0));
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, [until, props.id]);

  const _handleAppStateChange = (currentAppState: AppStateStatus) => {
    if (currentAppState === "active" && wentBackgroundAt && props.running) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      useLastUntil(until);
      useUntil(Math.max(0, until - diff));
    }
    if (currentAppState === "background") {
      useWentBackgroundAt(Date.now());
    }
  };

  const getTimeLeft = () => {
    return {
      seconds: String(parseInt(String(until % 60), 10)),
      minutes: String(parseInt(String((until / 60) % 60), 10)),
      hours: String(parseInt(String((until / (60 * 60)) % 24), 10)),
      days: String(parseInt(String(until / (60 * 60 * 24)), 10))
    };
  };

  const updateTimer = () => {
    // Don't fetch these values here, because their value might be changed
    // in another thread
    // const {lastUntil, until} = state;

    if (lastUntil === until || !props.running) {
      return;
    }
    if (until === 1 || (until === 0 && lastUntil !== 1)) {
      if (props.onFinish) {
        props.onFinish();
      }
      if (props.onChange) {
        props.onChange(until);
      }
    }

    if (until === 0) {
      useLastUntil(0);
      useUntil(0);
    } else {
      if (props.onChange) {
        props.onChange(until);
      }
      useLastUntil(until);
      useUntil(Math.max(0, until - 1));
    }
  };

  const renderLabel = (label: string) => {
    const { timeLabelStyle, size } = props;
    if (label) {
      return (
        <Text
          style={[styles.timeTxt, { fontSize: size! / 1.8 }, timeLabelStyle]}
        >
          {label}
        </Text>
      );
    }
  };

  const renderDigit = (d: string) => {
    const { digitStyle, digitTxtStyle, size } = props;
    return (
      <View
        style={[
          styles.digitCont,
          { width: size! * 2.3, height: size! * 2.6 },
          digitStyle
        ]}
      >
        <Text style={[styles.digitTxt, { fontSize: size }, digitTxtStyle]}>
          {d}
        </Text>
      </View>
    );
  };

  const renderDoubleDigits = (label: string, digits: string) => {
    return (
      <View style={styles.doubleDigitCont}>
        <View style={styles.timeInnerCont}>{renderDigit(digits)}</View>
        {renderLabel(label)}
      </View>
    );
  };

  const renderSeparator = () => {
    const { separatorStyle, size } = props;
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text
          style={[
            styles.separatorTxt,
            { fontSize: size! * 1.2 },
            separatorStyle
          ]}
        >
          {":"}
        </Text>
      </View>
    );
  };

  const renderCountDown = () => {
    const { timeToShow, timeLabels, showSeparator } = props;
    const { days, hours, minutes, seconds } = getTimeLeft();
    const newTime = sprintf(
      "%02d:%02d:%02d:%02d",
      days,
      hours,
      minutes,
      seconds
    ).split(":");

    return (
      <TouchableOpacity
        disabled={props.onPress ? false : true}
        style={styles.timeCont}
        onPress={props.onPress}
      >
        {timeToShow!.includes("D")
          ? renderDoubleDigits(timeLabels!.d!, newTime[0])
          : null}
        {showSeparator && timeToShow!.includes("D") && timeToShow!.includes("H")
          ? renderSeparator()
          : null}
        {timeToShow!.includes("H")
          ? renderDoubleDigits(timeLabels!.h!, newTime[1])
          : null}
        {showSeparator && timeToShow!.includes("H") && timeToShow!.includes("M")
          ? renderSeparator()
          : null}
        {timeToShow!.includes("M")
          ? renderDoubleDigits(timeLabels!.m!, newTime[2])
          : null}
        {showSeparator && timeToShow!.includes("M") && timeToShow!.includes("S")
          ? renderSeparator()
          : null}
        {timeToShow!.includes("S")
          ? renderDoubleDigits(timeLabels!.s!, newTime[3])
          : null}
      </TouchableOpacity>
    );
  };

  return <View style={props.style}>{renderCountDown()}</View>;
};

export default CountdownTimer;
