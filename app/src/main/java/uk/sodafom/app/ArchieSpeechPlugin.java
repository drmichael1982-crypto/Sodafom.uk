package uk.sodafom.app;

import android.media.AudioAttributes;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/** Local Android speech. Never changes system volume or logs children's spoken text. */
@CapacitorPlugin(name = "ArchieSpeech")
public class ArchieSpeechPlugin extends Plugin implements TextToSpeech.OnInitListener {
    private TextToSpeech tts;
    private boolean ready;
    private boolean destroyed;
    private PluginCall pendingCall;
    private String pendingText;
    private String activeId;
    private final Map<String, String> pinnedVoices = new HashMap<>();

    @Override public void load() {
        super.load();
        getActivity().runOnUiThread(() -> { if (!destroyed) tts = new TextToSpeech(getContext(), this); });
    }
    @Override public void onInit(int status) {
        getActivity().runOnUiThread(() -> {
            if (destroyed) return;
            if (status != TextToSpeech.SUCCESS || tts == null) {
                ready = false; rejectCurrent("Android Text-to-Speech could not initialise"); return;
            }
            tts.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_ACCESSIBILITY)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { }
                @Override public void onDone(String id) { finishExpected(id, "finished", false); }
                @Override public void onError(String id) { finishExpected(id, "Android speech playback failed", true); }
                @Override public void onError(String id, int error) { finishExpected(id, "Android speech playback failed", true); }
                @Override public void onStop(String id, boolean interrupted) { finishExpected(id, "stopped", false); }
            });
            ready = true;
            if (pendingCall != null && pendingText != null) doSpeak();
        });
    }
    @PluginMethod public void speak(PluginCall call) {
        final String text = call.getString("text", "").trim();
        final String character = call.getString("characterId", "archie").toLowerCase(Locale.ROOT);
        final String role = call.getString("role", "child-boy");
        if (role.equals("dog") || character.equals("jessica") || character.equals("sally") || character.equals("daisy")) {
            call.reject("Dogs use sound effects, not human speech", "DOG_REACTION_ONLY"); return;
        }
        getActivity().runOnUiThread(() -> {
            if (destroyed) { call.reject("Android speech is unavailable"); return; }
            settleCurrent("replaced");
            if (tts != null) tts.stop();
            if (text.isEmpty()) { JSObject result = new JSObject(); result.put("status", "finished"); call.resolve(result); return; }
            pendingCall = call;
            pendingText = text;
            // Old onDone/onStop events cannot finish a newer utterance.
            activeId = UUID.randomUUID().toString();
            if (ready && tts != null) doSpeak();
            else if (tts == null) tts = new TextToSpeech(getContext(), this);
        });
    }
    private boolean matchesRole(String name, String role) {
        String lower = name.toLowerCase(Locale.ROOT);
        // Boundaries prevent the previous "female contains male" bug.
        if (role.equals("child-boy")) return lower.matches(".*\\b(boy|child|young)\\b.*") && !lower.matches(".*\\b(female|girl|woman)\\b.*");
        if (role.equals("child-girl")) return lower.matches(".*\\b(girl|child|young)\\b.*") && !lower.matches(".*\\b(male|boy|man)\\b.*");
        if (role.equals("adult-woman")) return lower.matches(".*\\b(female|woman)\\b.*") && !lower.matches(".*\\b(child|girl|young)\\b.*");
        if (role.equals("adult-man")) return lower.matches(".*\\b(male|man)\\b.*") && !lower.matches(".*\\b(child|boy|young)\\b.*");
        return false;
    }
    private Voice chooseVoice(String character, String role, String explicitName) {
        Set<Voice> installed = tts.getVoices();
        List<Voice> local = new ArrayList<>();
        if (installed != null) for (Voice voice : installed) {
            if (voice != null && voice.getLocale() != null && voice.getName() != null
                    && voice.getLocale().getLanguage().equals("en") && !voice.isNetworkConnectionRequired()) local.add(voice);
        }
        String pinned = explicitName != null ? explicitName : pinnedVoices.get(character);
        if (pinned != null) {
            for (Voice voice : local) if (voice.getName().equals(pinned)) return voice;
            return null; // Never silently replace an unavailable pinned voice.
        }
        local.sort(Comparator.<Voice>comparingInt(voice -> matchesRole(voice.getName(), role) ? 0 : 1)
                .thenComparingInt(voice -> voice.getLocale().getCountry().equals("GB") ? 0 : 1)
                .thenComparing(Voice::getName));
        if (local.isEmpty()) return null;
        Voice chosen = local.get(0);
        pinnedVoices.put(character, chosen.getName());
        return chosen;
    }
    private float bounded(Double value, float fallback, float min, float max) {
        if (value == null || Double.isNaN(value) || Double.isInfinite(value)) return fallback;
        return Math.max(min, Math.min(max, value.floatValue()));
    }
    private void doSpeak() {
        if (tts == null || pendingCall == null || pendingText == null || activeId == null) return;
        try {
            String character = pendingCall.getString("characterId", "archie");
            String role = pendingCall.getString("role", "child-boy");
            Voice selected = chooseVoice(character, role, pendingCall.getString("voiceName"));
            if (selected == null || tts.setVoice(selected) == TextToSpeech.ERROR) {
                rejectCurrent("An installed local character voice is unavailable"); return;
            }
            tts.setSpeechRate(bounded(pendingCall.getDouble("rate"), 0.94f, 0.7f, 1.2f));
            tts.setPitch(bounded(pendingCall.getDouble("pitch"), 1.24f, 0.7f, 1.5f));
            Bundle parameters = new Bundle();
            parameters.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, bounded(pendingCall.getDouble("volume"), 0.85f, 0f, 1f));
            // Respect hardware mute/volume. Never call AudioManager.setStreamVolume.
            if (tts.speak(pendingText, TextToSpeech.QUEUE_FLUSH, parameters, activeId) == TextToSpeech.ERROR) {
                rejectCurrent("Android Text-to-Speech could not start");
            }
        } catch (Exception error) { rejectCurrent("Android Text-to-Speech could not start"); }
    }
    private void finishExpected(String id, String message, boolean error) {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(() -> {
            if (id == null || !id.equals(activeId)) return;
            if (error) rejectCurrent(message); else settleCurrent(message);
        });
    }
    private void settleCurrent(String status) {
        PluginCall call = pendingCall;
        pendingCall = null; pendingText = null; activeId = null;
        if (call != null) { JSObject result = new JSObject(); result.put("status", status); call.resolve(result); }
    }
    private void rejectCurrent(String message) {
        PluginCall call = pendingCall;
        pendingCall = null; pendingText = null; activeId = null;
        if (call != null) call.reject(message);
    }
    @PluginMethod public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            settleCurrent("stopped");
            if (tts != null) tts.stop();
            call.resolve();
        });
    }
    @PluginMethod public void isAvailable(PluginCall call) {
        JSObject result = new JSObject(); result.put("available", ready && !destroyed); call.resolve(result);
    }
    @Override protected void handleOnDestroy() {
        destroyed = true; ready = false; settleCurrent("stopped");
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        pinnedVoices.clear(); super.handleOnDestroy();
    }
}
