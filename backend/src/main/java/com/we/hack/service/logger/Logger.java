package com.we.hack.service.logger;

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

public class Logger {
    private static Logger instance;
    private static Queue<String> log;
    private static int SIZE;

    private Logger(int size) throws IOException {
        log = new LinkedList<>();
        logLoad();
        SIZE = size;
    }

    public synchronized static Logger getInstance(int size) throws IOException {
        if(instance == null) {
            instance = new Logger(size);
        }
        return instance;
    }

    private void logLoad() throws IOException {
        SimpleDateFormat ft = new SimpleDateFormat("dd-MM-yyyy");
        System.out.println(Logger.class.getPackage().getName().replace('.', '/'));
        String fileName = "src/main/java/"+ Logger.class.getPackage().getName().replace('.', '/') +"/logs/log_" + ft.format(new Date()) + ".log";
        File f = new File(fileName);

        if (!f.exists()) {
            if (f.createNewFile()) {
                System.out.println("New file created");
            } else {
                System.out.println("Error creating new file");
            }
        } else {
            try (BufferedReader reader = new BufferedReader(new FileReader(f))) {
                for (String line; (line = reader.readLine()) != null;) {
                    log.add(line);
                }
            }
        }
    }

    private boolean isFull() {
        return log.size() == SIZE;
    }

    private void shiftLog(){
        if(isFull()) {
            log.remove();
        }
    }

    private void writeLog(){
        SimpleDateFormat ft
                = new SimpleDateFormat("dd-MM-yyyy");
        String fileName = "src/main/java/"+ Logger.class.getPackage().getName().replace('.', '/') +"/logs/log_" + ft.format(new Date()) + ".log";
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(fileName, false))) {
            while (!log.isEmpty()) {
                writer.write(log.poll());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("An error occurred while writing to the file: " + e.getMessage());
        }
    }

    public void INFO(String msg){
        shiftLog();
        String temp = "[INFO] "+msg;
        log.add(temp);
        writeLog();
    }

    public void WARN(String msg){
        shiftLog();
        String temp = "[WARN] "+msg;
        log.add(temp);
        writeLog();
    }

    public void ERROR(String msg){
        shiftLog();
        String temp = "[ERROR] "+msg;
        log.add(temp);
        writeLog();
    }

    public void SEVERE(String msg){
        shiftLog();
        String temp = "[SEVERE] "+msg;
        log.add(temp);
        writeLog();
    }

    public void DEBUG(String msg){
        shiftLog();
        String temp = "[DEBUG] "+msg;
        log.add(temp);
        System.out.println("[DEBUG] "+msg);
        writeLog();
    }
}
