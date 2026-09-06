package uk.sodafom.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ArchieSpeechPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
