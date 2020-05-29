/*
 * ###########################
 * Hinweis:
 * Quelle: https://docs.camunda.org/get-started/java-process-app/project-setup/
 * The Process Application class constitutes the 
 * interface between your application and the process engine.
 * ###########################
 */ 
 
package org.hotelbuchung;

import org.camunda.bpm.application.ProcessApplication;
import org.camunda.bpm.application.impl.ServletProcessApplication;

@ProcessApplication("Hotelbuchung")
public class HotelbuchungApplication extends ServletProcessApplication {
  // empty implementation
}